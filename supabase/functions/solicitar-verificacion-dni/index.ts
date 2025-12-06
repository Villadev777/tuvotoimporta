import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerificationRequest {
  dni: string;
  email?: string;
  telefono?: string;
}

function hashString(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function generarCodigoVerificacion(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

    const body: VerificationRequest = await req.json();

    if (!body.dni || body.dni.length !== 8) {
      return new Response(
        JSON.stringify({ error: "DNI inválido. Debe tener 8 dígitos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const dniHash = hashString(body.dni);
    const emailHash = body.email ? hashString(body.email) : null;
    const telefonoHash = body.telefono ? hashString(body.telefono) : null;

    const { data: existente } = await supabase
      .from("usuarios_verificados")
      .select("id, usado")
      .eq("dni_hash", dniHash)
      .maybeSingle();

    if (existente && existente.usado) {
      return new Response(
        JSON.stringify({
          error: "Este DNI ya ha sido utilizado para votar",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const codigo = generarCodigoVerificacion();
    const codigoExpira = new Date(Date.now() + 15 * 60 * 1000);

    if (existente) {
      await supabase
        .from("usuarios_verificados")
        .update({
          codigo_verificacion: codigo,
          codigo_expira: codigoExpira.toISOString(),
          email_hash: emailHash,
          telefono_hash: telefonoHash,
        })
        .eq("id", existente.id);
    } else {
      await supabase.from("usuarios_verificados").insert({
        dni_hash: dniHash,
        email_hash: emailHash,
        telefono_hash: telefonoHash,
        verificado_por: body.email ? "email" : "dni",
        codigo_verificacion: codigo,
        codigo_expira: codigoExpira.toISOString(),
        usado: false,
      });
    }

    console.log(`Código de verificación generado para DNI: ${codigo}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Código de verificación generado",
        codigo_demo: codigo,
        expira_en: "15 minutos",
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