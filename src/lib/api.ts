import { supabase } from './supabase';
import type { CandidatoConPartido, ResultadoEncuesta } from '../types/database';
import { generateFingerprint, getUserHash, getBrowserInfo } from './fingerprint';
import { executeRecaptcha } from './recaptcha';
import { retryWithBackoff, createNetworkError } from './network';

export async function obtenerCandidatos(): Promise<CandidatoConPartido[]> {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase
      .from('candidatos')
      .select(`
        *,
        partido:partidos_politicos(
          *,
          investigaciones_partidarias:partidos_politicos_investigaciones(*)
        ),
        investigaciones:investigaciones_judiciales(*)
      `)
      .eq('activo', true)
      .in('tipo_candidato', ['PRECANDIDATO_OFICIAL', 'EN_DEFINICION'])
      .order('nombre_completo');

    if (error) throw createNetworkError(error);
    return data as CandidatoConPartido[];
  });
}

export async function obtenerCandidatoPorId(id: string): Promise<CandidatoConPartido | null> {
  const { data, error } = await supabase
    .from('candidatos')
    .select(`
      *,
      partido:partidos_politicos(
        *,
        investigaciones_partidarias:partidos_politicos_investigaciones(*)
      ),
      investigaciones:investigaciones_judiciales(*)
    `)
    .eq('id', id)
    .eq('activo', true)
    .maybeSingle();

  if (error) throw error;
  return data as CandidatoConPartido | null;
}

export async function obtenerResultadosEncuesta(): Promise<ResultadoEncuesta[]> {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase.rpc('obtener_resultados_encuesta');

    if (error) throw createNetworkError(error);
    return data || [];
  });
}

export async function registrarVoto(
  candidatoId: string,
  esVerificado: boolean = false,
  dni?: string,
  dniDigit?: string
): Promise<{ success: boolean; message: string; trust_score?: number }> {
  return retryWithBackoff(async () => {
    const fingerprint = await generateFingerprint();
    const usuarioHash = getUserHash();
    const navegadorInfo = getBrowserInfo();
    const recaptchaToken = await executeRecaptcha('vote');

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/procesar-voto`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidato_id: candidatoId,
        usuario_hash: usuarioHash,
        dispositivo_fingerprint: fingerprint.fingerprint,
        recaptcha_token: recaptchaToken,
        user_agent: navigator.userAgent,
        timezone_offset: new Date().getTimezoneOffset(),
        navegador_info: navegadorInfo,
        es_verificado: esVerificado,
        dni: dni,
        dni_digit: dniDigit,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw createNetworkError(new Error(errorData.message || 'Error al registrar voto'));
    }

    const result = await response.json();
    return result;
  }, { maxRetries: 2 });
}

export async function verificarVotoPrevio(): Promise<boolean> {
  const usuarioHash = getUserHash();
  const fingerprint = await generateFingerprint();

  const { count, error } = await supabase
    .from('encuesta_votos')
    .select('id', { count: 'exact', head: true })
    .or(`usuario_hash.eq.${usuarioHash},dispositivo_fingerprint.eq.${fingerprint.fingerprint}`);

  if (error) throw error;
  return (count || 0) > 0;
}

export function suscribirACambiosVotos(
  callback: () => void
) {
  const channel = supabase
    .channel('votos-realtime')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'candidatos',
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
