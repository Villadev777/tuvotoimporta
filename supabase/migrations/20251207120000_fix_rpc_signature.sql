/*
  # Corrección de Firma RPC para Procesar Voto
  
  ## Problema
  La Edge Function `procesar-voto` envía parámetros que no coinciden con la firma actual de la función
  `validar_y_registrar_voto`, causando errores 403/500 al intentar registrar votos.
  
  ## Solución
  Actualizar la función `validar_y_registrar_voto` para aceptar:
  - p_trust_score (numeric): Calculado externamente (incluyendo reCAPTCHA)
  - p_metadata (jsonb): Datos adicionales incluyendo user_agent
  - p_dispositivo_fingerprint: Nombre actualizado
  - p_fingerprint_data: Nombre actualizado para el objeto JSON
  
  ## Cambios
  1. Eliminar la función antigua para evitar ambigüedad.
  2. Crear la nueva versión que utiliza el trust_score proporcionado.
  3. Extraer user_agent de metadata.
*/

-- 1. Eliminar versiones anteriores de la función para evitar conflictos de sobrecarga
DROP FUNCTION IF EXISTS validar_y_registrar_voto(uuid, text, text, text, text, jsonb);
DROP FUNCTION IF EXISTS validar_y_registrar_voto(uuid, text, text, text, jsonb);

-- 2. Crear nueva función actualizada
CREATE OR REPLACE FUNCTION validar_y_registrar_voto(
  p_candidato_id uuid,
  p_usuario_hash text,
  p_dispositivo_fingerprint text,
  p_ip_hash text,
  p_fingerprint_data jsonb DEFAULT '{}'::jsonb,
  p_trust_score numeric DEFAULT 0,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb AS $$
DECLARE
  v_usuario_id uuid;
  v_voto_id uuid;
  v_resultado_validacion text;
  v_es_sospechoso boolean := false;
  v_razon_rechazo text := NULL;
  v_ip_bloqueada boolean;
  v_votos_recientes integer;
  v_mismo_dispositivo integer;
  v_user_agent text;
  v_final_trust_score numeric;
  v_es_verificado boolean;
BEGIN
  -- Extraer datos de metadata
  v_user_agent := p_metadata->>'user_agent';
  v_es_verificado := COALESCE((p_metadata->>'es_verificado')::boolean, false);
  v_final_trust_score := p_trust_score;

  -- 1. Verificar si la IP está bloqueada
  SELECT EXISTS(
    SELECT 1 FROM ips_bloqueadas 
    WHERE ip_hash = p_ip_hash 
    AND (expira_en IS NULL OR expira_en > NOW())
  ) INTO v_ip_bloqueada;
  
  IF v_ip_bloqueada THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'IP_BLOQUEADA',
      'message', 'Su dirección IP ha sido bloqueada temporalmente',
      'trust_score', v_final_trust_score
    );
  END IF;

  -- 2. Buscar o crear usuario (Sesión)
  SELECT id INTO v_usuario_id
  FROM sesiones_voto
  WHERE usuario_fingerprint_hash = p_dispositivo_fingerprint;
  
  IF v_usuario_id IS NULL THEN
    INSERT INTO sesiones_voto (usuario_fingerprint_hash, ip_hash, dispositivo_info)
    VALUES (p_dispositivo_fingerprint, p_ip_hash, p_fingerprint_data)
    RETURNING id INTO v_usuario_id;
  END IF;

  -- 3. Validaciones de seguridad (Heurística básica)
  
  -- 3a. Verificar votos recientes (mismo usuario hash, últimos 5 min)
  SELECT COUNT(*) INTO v_votos_recientes
  FROM encuesta_votos
  WHERE usuario_hash = p_usuario_hash
  AND created_at > NOW() - INTERVAL '5 minutes';
  
  IF v_votos_recientes >= 3 THEN
    v_es_sospechoso := true;
    v_razon_rechazo := 'Demasiados votos en poco tiempo';
    v_final_trust_score := GREATEST(0, v_final_trust_score - 50);
  END IF;

  -- 3b. Verificar mismo dispositivo votando repetidamente (fingerprint)
  SELECT COUNT(*) INTO v_mismo_dispositivo
  FROM encuesta_votos
  WHERE dispositivo_fingerprint = p_dispositivo_fingerprint
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF v_mismo_dispositivo >= 5 THEN
    v_es_sospechoso := true;
    v_razon_rechazo := COALESCE(v_razon_rechazo || ', ', '') || 'Múltiples votos desde mismo dispositivo';
    v_final_trust_score := GREATEST(0, v_final_trust_score - 30);
  END IF;

  -- 4. Determinar resultado de validación
  -- Si el score es muy bajo (< 0.3 en recaptcha escala a 30) o tiene flags sospechosos
  -- Nota: El usuario envía p_trust_score como recaptcha_score (0.0 a 1.0) desde el edge function?
  -- REVISIÓN: El Edge Function del usuario hace: `const trustScore = recaptchaScore;` (0.0 - 1.0)
  -- PERO la DB usa escala 0-100?
  -- En migraciones anteriores: `v_trust_score := 100.0` y restaba puntos.
  -- Ajustemos la escala: Si viene <= 1.0, asumimos que es Recaptcha y lo multiplicamos por 100.
  
  IF v_final_trust_score <= 1.0 THEN
    v_final_trust_score := v_final_trust_score * 100;
  END IF;

  IF v_es_sospechoso OR v_final_trust_score < 30 THEN
    v_resultado_validacion := 'EN_REVISION';
    v_es_sospechoso := true; -- Forzar sospechoso si score es bajo
  ELSIF v_final_trust_score >= 70 THEN
    v_resultado_validacion := 'APROBADO';
  ELSE
    v_resultado_validacion := 'PENDIENTE'; -- Entre 30 y 70
  END IF;

  -- 5. Insertar voto
  INSERT INTO encuesta_votos (
    candidato_id,
    usuario_id,
    usuario_hash,
    dispositivo_fingerprint,
    ip_hash,
    user_agent,
    trust_score,
    es_sospechoso,
    resultado_validacion,
    es_verificado,
    metadata,
    metodo_verificacion
  ) VALUES (
    p_candidato_id,
    v_usuario_id,
    p_usuario_hash,
    p_dispositivo_fingerprint,
    p_ip_hash,
    v_user_agent,
    v_final_trust_score,
    v_es_sospechoso,
    v_resultado_validacion,
    v_es_verificado,
    p_metadata,
    CASE WHEN v_es_verificado THEN 'EMAIL_SMS' ELSE 'NINGUNO' END
  ) RETURNING id INTO v_voto_id;

  -- 6. Si es muy sospechoso, registrar patrón
  IF v_es_sospechoso THEN
    INSERT INTO patrones_sospechosos (
      tipo_patron,
      descripcion,
      nivel_riesgo,
      metadata
    ) VALUES (
      'SOSPECHA_AUTOMATICA',
      COALESCE(v_razon_rechazo, 'Trust score bajo: ' || v_final_trust_score),
      CASE WHEN v_final_trust_score < 20 THEN 'ALTO' ELSE 'MEDIO' END,
      jsonb_build_object(
        'voto_id', v_voto_id,
        'usuario_id', v_usuario_id,
        'original_score', p_trust_score
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'voto_id', v_voto_id,
    'trust_score', v_final_trust_score,
    'es_sospechoso', v_es_sospechoso,
    'resultado', v_resultado_validacion,
    'requiere_revision', (v_resultado_validacion = 'EN_REVISION' OR v_resultado_validacion = 'PENDIENTE')
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'ERROR_INTERNO',
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;
