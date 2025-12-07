import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VoteRequest {
  candidato_id: string;
  usuario_hash: string;
  dispositivo_fingerprint: string;
  recaptcha_token?: string;
  user_agent: string;
  timezone_offset: number;
  navegador_info: Record<string, unknown>;
  es_verificado?: boolean;
}

function getClientIP(req: Request): string {
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;
  
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  
  const xRealIP = req.headers.get("x-real-ip");
  if (xRealIP) return xRealIP;
  
  return "unknown";
}

function hashString(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

async function verifyRecaptcha(token: string | undefined): Promise<number> {
  if (!token) return 0.5;
  
  try {
    const secretKey = Deno.env.get("RECAPTCHA_SECRET_KEY");
    if (!secretKey) {
      console.warn("RECAPTCHA_SECRET_KEY not configured");
      return 0.5;
    }
    
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${token}`,
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      return data.score || 0.5;
    }
    
    console.warn("reCAPTCHA verification failed:", data);
    return 0.3;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return 0.5;
  }
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
    
    const clientIP = getClientIP(req);
    const ipHash = hashString(clientIP);
    
    const body: VoteRequest = await req.json();
    
    const recaptchaScore = await verifyRecaptcha(body.recaptcha_token);

    const trustScore = recaptchaScore;

    const metadata = {
      user_agent: body.user_agent,
      timezone_offset: body.timezone_offset,
      navegador_info: body.navegador_info,
      recaptcha_score: recaptchaScore,
      es_verificado: body.es_verificado || false,
    };

    const { data: validationResult, error: validationError } = await supabase.rpc(
      "validar_y_registrar_voto",
      {
        p_candidato_id: body.candidato_id,
        p_usuario_hash: body.usuario_hash,
        p_dispositivo_fingerprint: body.dispositivo_fingerprint,
        p_ip_hash: ipHash,
        p_fingerprint_data: body.navegador_info,
        p_trust_score: trustScore,
        p_metadata: metadata,
      }
    );

    if (validationError) {
      console.error("Validation error:", validationError);
      return new Response(
        JSON.stringify({ error: "Error al validar voto", details: validationError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: validationResult.message || "No se pudo procesar tu voto",
          error: validationResult.error,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (validationResult.requiere_revision) {
      return new Response(
        JSON.stringify({
          success: true,
          pending_review: true,
          message: "Tu voto está en revisión y será validado pronto",
          voto_id: validationResult.voto_id,
          resultado: validationResult.resultado,
        }),
        {
          status: 202,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Voto registrado exitosamente",
        voto_id: validationResult.voto_id,
        resultado: validationResult.resultado,
        trust_score: trustScore,
        recaptcha_score: recaptchaScore,
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