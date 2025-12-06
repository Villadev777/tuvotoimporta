import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyCodeRequest {
  dni: string;
  codigo: string;
}

function hashString(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: VerifyCodeRequest = await req.json();

    if (!body.dni || !body.codigo) {
      return new Response(
        JSON.stringify({ error: "DNI y código son requeridos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const dniHash = hashString(body.dni);

    const { data: verificacion, error: fetchError } = await supabase
      .from("usuarios_verificados")
      .select("*")
      .eq("dni_hash", dniHash)
      .maybeSingle();

    if (fetchError || !verificacion) {
      return new Response(
        JSON.stringify({ error: "No se encontró una solicitud de verificación" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (verificacion.usado) {
      return new Response(
        JSON.stringify({ error: "Este DNI ya ha sido utilizado para votar" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (new Date(verificacion.codigo_expira) < new Date()) {
      return new Response(
        JSON.stringify({ error: "El código ha expirado. Solicita uno nuevo" }),
        {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (verificacion.codigo_verificacion !== body.codigo) {
      return new Response(
        JSON.stringify({ error: "Código incorrecto" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { error: updateError } = await supabase
      .from("usuarios_verificados")
      .update({
        fecha_verificacion: new Date().toISOString(),
      })
      .eq("id", verificacion.id);

    if (updateError) {
      console.error("Error updating verification:", updateError);
      return new Response(
        JSON.stringify({ error: "Error al verificar" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "DNI verificado exitosamente",
        dni_hash: dniHash,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});