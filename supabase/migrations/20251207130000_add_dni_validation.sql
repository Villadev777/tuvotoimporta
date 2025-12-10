/*
  # Agregar Validación de DNI
  
  ## Cambios
  1.  Agregar columna `dni_hash` a `encuesta_votos` (UNIQUE para evitar doble voto).
  2.  Actualizar `validar_y_registrar_voto` para recibir y verificar `p_dni_hash`.
  
  ## Notas
  - El DNI se almacena hasheado (SHA-256) por privacidad.
  - La verificación del dígito verificador se hace en Cliente/Edge.
*/

-- 1. Agregar columna dni_hash
ALTER TABLE encuesta_votos 
ADD COLUMN IF NOT EXISTS dni_hash text;

-- 2. Crear índice único para evitar votos duplicados por DNI (además de fingerprint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_votos_unique_dni 
ON encuesta_votos(dni_hash);

-- 3. Actualizar función RPC para aceptar DNI
DROP FUNCTION IF EXISTS validar_y_registrar_voto(uuid, text, text, text, jsonb, numeric, jsonb);

CREATE OR REPLACE FUNCTION validar_y_registrar_voto(
  p_candidato_id uuid,
  p_usuario_hash text,
  p_dispositivo_fingerprint text,
  p_ip_hash text,
  p_fingerprint_data jsonb DEFAULT '{}'::jsonb,
  p_trust_score numeric DEFAULT 0,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_dni_hash text DEFAULT NULL -- Nuevo parámetro opcional (pero requerido por lógica de negocio)
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
  v_ya_voto_fingerprint boolean;
  v_ya_voto_dni boolean;
BEGIN
  -- Extraer datos de metadata
  v_user_agent := p_metadata->>'user_agent';
  v_es_verificado := COALESCE((p_metadata->>'es_verificado')::boolean, false);
  v_final_trust_score := p_trust_score;

  -- 0a. Verificar DUPLICADO por DNI (¡CRÍTICO!)
  IF p_dni_hash IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM encuesta_votos 
      WHERE dni_hash = p_dni_hash
    ) INTO v_ya_voto_dni;

    IF v_ya_voto_dni THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'ALREADY_VOTED_DNI',
        'message', 'Este DNI ya ha sido utilizado para votar.',
        'trust_score', v_final_trust_score
      );
    END IF;
  END IF;

  -- 0b. Verificar DUPLICADO por Fingerprint (Mantiene lógica anterior)
  SELECT EXISTS(
    SELECT 1 FROM encuesta_votos 
    WHERE usuario_hash = p_usuario_hash 
    AND dispositivo_fingerprint = p_dispositivo_fingerprint
  ) INTO v_ya_voto_fingerprint;

  IF v_ya_voto_fingerprint THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ALREADY_VOTED',
      'message', 'Ya has realizado tu voto desde este dispositivo',
      'trust_score', v_final_trust_score
    );
  END IF;

  -- 1. Verificar IP bloqueada
  SELECT EXISTS(
    SELECT 1 FROM ips_bloqueadas 
    WHERE ip_hash = p_ip_hash 
    AND (bloqueado_hasta IS NULL OR bloqueado_hasta > NOW())
  ) INTO v_ip_bloqueada;
  
  IF v_ip_bloqueada THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'IP_BLOQUEADA',
      'message', 'Su dirección IP ha sido bloqueada temporalmente',
      'trust_score', v_final_trust_score
    );
  END IF;

  -- 2. Buscar o crear usuario (Sesión en memoria)
  SELECT id INTO v_usuario_id
  FROM sesiones_voto
  WHERE dispositivo_fingerprint = p_dispositivo_fingerprint
  LIMIT 1;
  
  IF v_usuario_id IS NULL THEN
    INSERT INTO sesiones_voto (dispositivo_fingerprint, ip_hash, navegador_info, usuario_hash)
    VALUES (p_dispositivo_fingerprint, p_ip_hash, p_fingerprint_data, p_usuario_hash)
    RETURNING id INTO v_usuario_id;
  END IF;

  -- 3. Validaciones de comportamiento (Rate limiting)
  SELECT COUNT(*) INTO v_votos_recientes
  FROM encuesta_votos
  WHERE usuario_hash = p_usuario_hash
  AND created_at > NOW() - INTERVAL '5 minutes';
  
  IF v_votos_recientes >= 3 THEN
    v_es_sospechoso := true;
    v_razon_rechazo := 'Demasiados votos en poco tiempo';
    v_final_trust_score := GREATEST(0, v_final_trust_score - 50);
  END IF;

  SELECT COUNT(*) INTO v_mismo_dispositivo
  FROM encuesta_votos
  WHERE dispositivo_fingerprint = p_dispositivo_fingerprint
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF v_mismo_dispositivo >= 5 THEN
    v_es_sospechoso := true;
    v_razon_rechazo := COALESCE(v_razon_rechazo || ', ', '') || 'Múltiples votos desde mismo dispositivo';
    v_final_trust_score := GREATEST(0, v_final_trust_score - 30);
  END IF;

  -- 4. Determinar resultado
  IF v_final_trust_score <= 1.0 THEN
    v_final_trust_score := v_final_trust_score * 100;
  END IF;

  IF v_es_sospechoso OR v_final_trust_score < 30 THEN
    v_resultado_validacion := 'EN_REVISION';
    v_es_sospechoso := true; 
  ELSIF v_final_trust_score >= 70 THEN
    v_resultado_validacion := 'APROBADO';
  ELSE
    v_resultado_validacion := 'PENDIENTE';
  END IF;

  -- 5. Insertar voto (Try/Catch para unique constraints finales)
  BEGIN
    INSERT INTO encuesta_votos (
      candidato_id,
      usuario_hash,
      dispositivo_fingerprint,
      ip_hash,
      user_agent,
      trust_score,
      es_sospechoso,
      resultado_validacion,
      es_verificado,
      metadata,
      metodo_verificacion,
      dni_hash -- Nuevo campo
    ) VALUES (
      p_candidato_id,
      p_usuario_hash,
      p_dispositivo_fingerprint,
      p_ip_hash,
      v_user_agent,
      v_final_trust_score,
      v_es_sospechoso,
      v_resultado_validacion,
      v_es_verificado,
      p_metadata,
      CASE WHEN v_es_verificado THEN 'EMAIL_SMS' ELSE 'NINGUNO' END,
      p_dni_hash
    ) RETURNING id INTO v_voto_id;
  EXCEPTION 
    WHEN unique_violation THEN
      -- Determinar cuál constraint falló (aunque ya revisamos antes, es el hard stop)
      RETURN jsonb_build_object(
        'success', false,
        'error', 'ALREADY_VOTED',
        'message', 'Ya se ha registrado un voto con estos datos (Dispositivo o DNI)',
        'trust_score', v_final_trust_score
      );
  END;

  RETURN jsonb_build_object(
    'success', true,
    'voto_id', v_voto_id,
    'trust_score', v_final_trust_score,
    'es_sospechoso', v_es_sospechoso,
    'resultado', v_resultado_validacion
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'ERROR_INTERNO',
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
