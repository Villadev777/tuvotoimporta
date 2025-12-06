/*
  # Ajustar umbral de trust score para desarrollo

  1. Cambios
    - Reducir umbral mínimo de trust score de 30 a 15
    - Esto permite votos durante desarrollo con reCAPTCHA básico
    - Los votos verificados por DNI siguen sin restricción (score 0)
  
  2. Notas
    - Para producción, considerar subir a 25-30 cuando reCAPTCHA esté configurado
    - El umbral actual (30) es muy alto con reCAPTCHA score típico de 0.5 (20 puntos)
*/

CREATE OR REPLACE FUNCTION validar_y_registrar_voto(
  p_usuario_hash text,
  p_fingerprint text,
  p_ip_hash text,
  p_recaptcha_score numeric,
  p_user_agent text,
  p_timezone_offset integer,
  p_navegador_info jsonb,
  p_es_verificado boolean DEFAULT false
) RETURNS jsonb AS $$
DECLARE
  v_trust_score numeric;
  v_puede_votar boolean := true;
  v_motivo_rechazo text := null;
  v_resultado jsonb;
  v_intentos_recientes integer;
  v_ip_bloqueada boolean;
BEGIN
  -- Calcular trust score
  v_trust_score := calcular_trust_score(
    p_recaptcha_score,
    p_ip_hash,
    p_fingerprint,
    p_usuario_hash,
    p_es_verificado
  );
  
  -- Verificar si ya votó (usuario_hash + fingerprint)
  IF EXISTS(
    SELECT 1 FROM encuesta_votos 
    WHERE usuario_hash = p_usuario_hash 
      AND dispositivo_fingerprint = p_fingerprint
  ) THEN
    v_puede_votar := false;
    v_motivo_rechazo := 'Ya has votado con este dispositivo';
  END IF;
  
  -- Verificar IP bloqueada
  SELECT EXISTS(
    SELECT 1 FROM ips_bloqueadas 
    WHERE ip_hash = p_ip_hash 
      AND bloqueado_hasta > now()
  ) INTO v_ip_bloqueada;
  
  IF v_ip_bloqueada THEN
    v_puede_votar := false;
    v_motivo_rechazo := 'IP temporalmente bloqueada por actividad sospechosa';
  END IF;
  
  -- Verificar rate limiting (máximo 3 intentos por hora por IP)
  SELECT COUNT(*) INTO v_intentos_recientes
  FROM sesiones_voto
  WHERE ip_hash = p_ip_hash
    AND intento_timestamp > now() - interval '1 hour';
  
  IF v_intentos_recientes >= 3 THEN
    v_puede_votar := false;
    v_motivo_rechazo := 'Demasiados intentos. Intenta en 1 hora';
    
    -- Bloquear IP por 1 hora
    INSERT INTO ips_bloqueadas (ip_hash, motivo, bloqueado_hasta, intentos_fallidos)
    VALUES (p_ip_hash, 'Rate limit excedido', now() + interval '1 hour', v_intentos_recientes)
    ON CONFLICT (ip_hash) DO UPDATE SET
      intentos_fallidos = ips_bloqueadas.intentos_fallidos + 1,
      bloqueado_hasta = now() + interval '1 hour',
      updated_at = now();
  END IF;
  
  -- Verificar score mínimo (15 para votos no verificados, 0 para verificados)
  IF v_trust_score < 15 AND NOT p_es_verificado THEN
    v_puede_votar := false;
    v_motivo_rechazo := 'Score de confianza muy bajo. Considera verificar tu identidad';
  END IF;
  
  -- Registrar intento en sesiones_voto
  INSERT INTO sesiones_voto (
    usuario_hash,
    dispositivo_fingerprint,
    ip_hash,
    fue_exitoso,
    motivo_rechazo,
    recaptcha_score,
    trust_score,
    user_agent,
    navegador_info
  ) VALUES (
    p_usuario_hash,
    p_fingerprint,
    p_ip_hash,
    v_puede_votar,
    v_motivo_rechazo,
    p_recaptcha_score,
    v_trust_score,
    p_user_agent,
    p_navegador_info
  );
  
  -- Registrar en audit log
  INSERT INTO audit_logs (evento, usuario_hash, ip_hash, detalles)
  VALUES (
    CASE WHEN v_puede_votar THEN 'voto_validado' ELSE 'voto_rechazado' END,
    p_usuario_hash,
    p_ip_hash,
    jsonb_build_object(
      'trust_score', v_trust_score,
      'recaptcha_score', p_recaptcha_score,
      'motivo_rechazo', v_motivo_rechazo,
      'es_verificado', p_es_verificado
    )
  );
  
  -- Preparar resultado
  v_resultado := jsonb_build_object(
    'puede_votar', v_puede_votar,
    'trust_score', v_trust_score,
    'motivo_rechazo', v_motivo_rechazo,
    'requiere_revision', v_trust_score BETWEEN 15 AND 50
  );
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;