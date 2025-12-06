/*
  # Corrección de Problemas de Seguridad y Optimización de Base de Datos

  ## Cambios Implementados

  ### 1. Índices de Foreign Keys
  - **Agregado**: Índice para `investigaciones_judiciales.partido_id` para mejorar rendimiento de queries con joins

  ### 2. Eliminación de Índices No Utilizados
  Se eliminan 27 índices que no están siendo usados por las queries actuales:
  - Índices en tabla `candidatos`: partido, semaforo, activo, tipo_candidato, inscrito_onpe, tipo_activo
  - Índices en tabla `encuesta_votos`: candidato, usuario_hash, dispositivo, created, ip_hash, trust_score, verificado
  - Índices en tabla `sesiones_voto`: usuario
  - Índices en tabla `ips_bloqueadas`: expiracion
  - Índices en tabla `patrones_sospechosos`: tipo, riesgo, fecha
  - Índices en tabla `usuarios_verificados`: dni, telefono, usado
  - Índices en tabla `votos_pendientes`: estado, candidato, fecha
  - Índices en tabla `audit_logs`: evento, usuario, timestamp
  - Índices en tabla `partidos_politicos`: estado_candidatura

  ### 3. Vistas de Seguridad
  - **Reconstruidas sin SECURITY DEFINER**: Las vistas ahora usan permisos del usuario que las ejecuta
    - `votos_sospechosos_resumen`
    - `estadisticas_seguridad`

  ### 4. Funciones con Search Path Seguro
  - **Agregado `SET search_path = public`** a todas las funciones para prevenir ataques de búsqueda de esquema:
    - `analizar_patron_fraude_instantaneo()`
    - `incrementar_voto_candidato()`
    - `validar_y_registrar_voto()`

  ## Beneficios de Seguridad
  - Prevención de ataques de search path injection
  - Reducción de superficie de ataque en vistas
  - Mejor rendimiento al eliminar índices innecesarios
  - Mejora en queries con foreign keys
*/

-- =====================================================
-- 1. ADD MISSING INDEX FOR FOREIGN KEY
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_investigaciones_partido_id 
ON investigaciones_judiciales(partido_id);

-- =====================================================
-- 2. DROP UNUSED INDEXES
-- =====================================================

-- Candidatos table indexes
DROP INDEX IF EXISTS idx_candidatos_partido;
DROP INDEX IF EXISTS idx_candidatos_semaforo;
DROP INDEX IF EXISTS idx_candidatos_activo;
DROP INDEX IF EXISTS idx_candidatos_tipo_candidato;
DROP INDEX IF EXISTS idx_candidatos_inscrito_onpe;
DROP INDEX IF EXISTS idx_candidatos_tipo_activo;

-- Encuesta_votos table indexes
DROP INDEX IF EXISTS idx_votos_candidato;
DROP INDEX IF EXISTS idx_votos_usuario_hash;
DROP INDEX IF EXISTS idx_votos_dispositivo;
DROP INDEX IF EXISTS idx_votos_created;
DROP INDEX IF EXISTS idx_votos_ip_hash;
DROP INDEX IF EXISTS idx_votos_trust_score;
DROP INDEX IF EXISTS idx_votos_verificado;

-- Sesiones_voto table indexes
DROP INDEX IF EXISTS idx_sesiones_voto_usuario;

-- Ips_bloqueadas table indexes
DROP INDEX IF EXISTS idx_ips_bloqueadas_expiracion;

-- Patrones_sospechosos table indexes
DROP INDEX IF EXISTS idx_patrones_tipo;
DROP INDEX IF EXISTS idx_patrones_riesgo;
DROP INDEX IF EXISTS idx_patrones_fecha;

-- Usuarios_verificados table indexes
DROP INDEX IF EXISTS idx_usuarios_verificados_dni;
DROP INDEX IF EXISTS idx_usuarios_verificados_telefono;
DROP INDEX IF EXISTS idx_usuarios_verificados_usado;

-- Votos_pendientes table indexes
DROP INDEX IF EXISTS idx_votos_pendientes_estado;
DROP INDEX IF EXISTS idx_votos_pendientes_candidato;
DROP INDEX IF EXISTS idx_votos_pendientes_fecha;

-- Audit_logs table indexes
DROP INDEX IF EXISTS idx_audit_logs_evento;
DROP INDEX IF EXISTS idx_audit_logs_usuario;
DROP INDEX IF EXISTS idx_audit_logs_timestamp;

-- Partidos_politicos table indexes
DROP INDEX IF EXISTS idx_partidos_estado_candidatura;

-- =====================================================
-- 3. RECREATE VIEWS WITHOUT SECURITY DEFINER
-- =====================================================

-- Drop existing views
DROP VIEW IF EXISTS votos_sospechosos_resumen;
DROP VIEW IF EXISTS estadisticas_seguridad;

-- Recreate votos_sospechosos_resumen without SECURITY DEFINER
CREATE VIEW votos_sospechosos_resumen AS
SELECT 
  DATE_TRUNC('hour', created_at) as hora,
  COUNT(*) as total_votos,
  SUM(CASE WHEN es_sospechoso THEN 1 ELSE 0 END) as votos_sospechosos,
  SUM(CASE WHEN resultado_validacion = 'RECHAZADO' THEN 1 ELSE 0 END) as votos_rechazados,
  AVG(trust_score) as trust_score_promedio
FROM encuesta_votos
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hora DESC;

-- Recreate estadisticas_seguridad without SECURITY DEFINER
CREATE VIEW estadisticas_seguridad AS
SELECT 
  (SELECT COUNT(*) FROM encuesta_votos WHERE es_sospechoso = true) as total_sospechosos,
  (SELECT COUNT(*) FROM encuesta_votos WHERE resultado_validacion = 'RECHAZADO') as total_rechazados,
  (SELECT COUNT(*) FROM encuesta_votos WHERE resultado_validacion = 'APROBADO') as total_aprobados,
  (SELECT COUNT(*) FROM encuesta_votos WHERE resultado_validacion = 'EN_REVISION') as total_en_revision,
  (SELECT COUNT(DISTINCT ip_hash) FROM encuesta_votos WHERE es_sospechoso = true) as ips_sospechosas,
  (SELECT AVG(trust_score) FROM encuesta_votos) as trust_score_promedio;

-- =====================================================
-- 4. FIX FUNCTIONS WITH IMMUTABLE SEARCH PATH
-- =====================================================

-- Fix analizar_patron_fraude_instantaneo
CREATE OR REPLACE FUNCTION analizar_patron_fraude_instantaneo()
RETURNS TRIGGER AS $$
DECLARE
  v_votos_ultimos_minutos integer;
  v_candidato_burst integer;
BEGIN
  -- A. Detección de "Ráfaga Veloz" (Speed Burst)
  -- Si entraron más de 10 votos en el último segundo (humanamente imposible para tráfico normal)
  SELECT COUNT(*) INTO v_votos_ultimos_minutos
  FROM encuesta_votos
  WHERE created_at > NOW() - INTERVAL '1 second';

  IF v_votos_ultimos_minutos > 10 THEN
    -- Marcar el voto actual como SÓLO PENDIENTE DE REVISIÓN (no aprobado)
    NEW.es_sospechoso := true;
    NEW.resultado_validacion := 'EN_REVISION';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Fix incrementar_voto_candidato
CREATE OR REPLACE FUNCTION incrementar_voto_candidato()
RETURNS TRIGGER AS $$
BEGIN
  -- Only count approved votes
  IF NEW.resultado_validacion = 'APROBADO' THEN
    UPDATE candidatos
    SET total_votos = total_votos + 1
    WHERE id = NEW.candidato_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;

-- Fix validar_y_registrar_voto
CREATE OR REPLACE FUNCTION validar_y_registrar_voto(
  p_candidato_id uuid,
  p_fingerprint_hash text,
  p_ip_hash text,
  p_dispositivo_info jsonb,
  p_trust_score integer
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
BEGIN
  -- 1. Verificar si la IP está bloqueada
  SELECT EXISTS(
    SELECT 1 FROM ips_bloqueadas 
    WHERE ip_hash = p_ip_hash 
    AND (expira_en IS NULL OR expira_en > NOW())
  ) INTO v_ip_bloqueada;
  
  IF v_ip_bloqueada THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'IP bloqueada',
      'es_sospechoso', true
    );
  END IF;

  -- 2. Buscar o crear usuario
  SELECT id INTO v_usuario_id
  FROM sesiones_voto
  WHERE usuario_fingerprint_hash = p_fingerprint_hash;
  
  IF v_usuario_id IS NULL THEN
    INSERT INTO sesiones_voto (usuario_fingerprint_hash, ip_hash, dispositivo_info)
    VALUES (p_fingerprint_hash, p_ip_hash, p_dispositivo_info)
    RETURNING id INTO v_usuario_id;
  END IF;

  -- 3. Validaciones de seguridad
  -- 3a. Verificar votos recientes (últimos 5 minutos)
  SELECT COUNT(*) INTO v_votos_recientes
  FROM encuesta_votos
  WHERE usuario_id = v_usuario_id
  AND created_at > NOW() - INTERVAL '5 minutes';
  
  IF v_votos_recientes >= 3 THEN
    v_es_sospechoso := true;
    v_razon_rechazo := 'Demasiados votos en poco tiempo';
  END IF;

  -- 3b. Verificar mismo dispositivo votando repetidamente
  SELECT COUNT(*) INTO v_mismo_dispositivo
  FROM encuesta_votos
  WHERE dispositivo_fingerprint = p_fingerprint_hash
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF v_mismo_dispositivo >= 5 THEN
    v_es_sospechoso := true;
    v_razon_rechazo := COALESCE(v_razon_rechazo || ', ', '') || 'Múltiples votos desde mismo dispositivo';
  END IF;

  -- 4. Determinar resultado de validación basado en trust score y flags
  IF v_es_sospechoso OR p_trust_score < 30 THEN
    v_resultado_validacion := 'EN_REVISION';
  ELSIF p_trust_score >= 70 THEN
    v_resultado_validacion := 'APROBADO';
  ELSE
    v_resultado_validacion := 'PENDIENTE';
  END IF;

  -- 5. Insertar voto
  INSERT INTO encuesta_votos (
    candidato_id,
    usuario_id,
    dispositivo_fingerprint,
    ip_hash,
    trust_score,
    es_sospechoso,
    resultado_validacion,
    razon_rechazo
  ) VALUES (
    p_candidato_id,
    v_usuario_id,
    p_fingerprint_hash,
    p_ip_hash,
    p_trust_score,
    v_es_sospechoso,
    v_resultado_validacion,
    v_razon_rechazo
  ) RETURNING id INTO v_voto_id;

  -- 6. Si es muy sospechoso, registrar patrón
  IF v_es_sospechoso THEN
    INSERT INTO patrones_sospechosos (
      tipo_patron,
      descripcion,
      nivel_riesgo,
      metadata
    ) VALUES (
      'MULTIPLE_VOTES',
      v_razon_rechazo,
      CASE WHEN p_trust_score < 20 THEN 'ALTO' ELSE 'MEDIO' END,
      jsonb_build_object(
        'voto_id', v_voto_id,
        'usuario_id', v_usuario_id,
        'trust_score', p_trust_score
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'voto_id', v_voto_id,
    'resultado_validacion', v_resultado_validacion,
    'es_sospechoso', v_es_sospechoso
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error al procesar voto: ' || SQLERRM
  );
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public;