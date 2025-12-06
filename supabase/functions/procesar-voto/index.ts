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
    
    const { data: validationResult, error: validationError } = await supabase.rpc(
      "validar_y_registrar_voto",
      {
        p_usuario_hash: body.usuario_hash,
        p_fingerprint: body.dispositivo_fingerprint,
        p_ip_hash: ipHash,
        p_recaptcha_score: recaptchaScore,
        p_user_agent: body.user_agent,
        p_timezone_offset: body.timezone_offset,
        p_navegador_info: body.navegador_info,
        p_es_verificado: body.es_verificado || false,
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
    
    if (!validationResult.puede_votar) {
      return new Response(
        JSON.stringify({
          success: false,
          message: validationResult.motivo_rechazo,
          trust_score: validationResult.trust_score,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (validationResult.requiere_revision) {
      const { error: pendingError } = await supabase
        .from("votos_pendientes")
        .insert({
          candidato_id: body.candidato_id,
          usuario_hash: body.usuario_hash,
          dispositivo_fingerprint: body.dispositivo_fingerprint,
          ip_hash: ipHash,
          motivo_sospecha: "Trust score entre 30-50, requiere revisión",
          trust_score: validationResult.trust_score,
          recaptcha_score: recaptchaScore,
        });
      
      if (pendingError) {
        console.error("Error inserting pending vote:", pendingError);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          pending_review: true,
          message: "Tu voto está en revisión y será validado pronto",
          trust_score: validationResult.trust_score,
        }),
        {
          status: 202,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const { error: insertError } = await supabase
      .from("encuesta_votos")
      .insert({
        candidato_id: body.candidato_id,
        usuario_hash: body.usuario_hash,
        dispositivo_fingerprint: body.dispositivo_fingerprint,
        ip_address: "hidden",
        ip_hash: ipHash,
        recaptcha_score: recaptchaScore,
        trust_score: validationResult.trust_score,
        es_verificado: body.es_verificado || false,
        user_agent: body.user_agent,
        timezone_offset: body.timezone_offset,
        navegador_info: body.navegador_info,
        resultado_validacion: "APROBADO",
        metodo_verificacion: body.es_verificado ? "EMAIL_SMS" : "NINGUNO",
        es_sospechoso: false,
        metadata: {},
      });
    
    if (insertError) {
      console.error("Insert error:", insertError);
      
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Ya has votado anteriormente",
          }),
          {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Error al registrar voto", details: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Voto registrado exitosamente",
        trust_score: validationResult.trust_score,
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