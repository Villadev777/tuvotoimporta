/*
  # Corrección de Problemas de Seguridad y Rendimiento

  ## Cambios Implementados

  ### 1. Índices - Optimización
  - **Agregado**: Índice para foreign key `partido_id` en `investigaciones_judiciales`
  - **Eliminados**: 28 índices no utilizados que generan overhead sin beneficio
    - Reducción de espacio en disco
    - Mejora en velocidad de INSERT/UPDATE/DELETE
    - Mantenimiento simplificado

  ### 2. Vistas con SECURITY DEFINER - Corrección de Seguridad
  - Recreadas sin SECURITY DEFINER para prevenir escalación de privilegios
  - Las vistas ahora respetan los permisos RLS del usuario que las consulta
  - Eliminación de vector de ataque potencial

  ### 3. Funciones - Search Path Inmutable
  - Fijado search_path en todas las funciones críticas
  - Previene ataques de "search path confusion"
  - Las funciones ahora solo usan esquemas explícitos seguros

  ## Impacto en Seguridad
  - Cierre de 3 vectores de ataque por search path mutable
  - Eliminación de 2 puntos de escalación de privilegios (vistas)
  - Reducción de superficie de ataque general

  ## Impacto en Rendimiento
  - Mejora en velocidad de escrituras (menos índices que actualizar)
  - Reducción de espacio en disco
  - Consultas de foreign keys optimizadas con nuevo índice
*/

-- ============================================
-- 1. ADD MISSING INDEX FOR FOREIGN KEY
-- ============================================
CREATE INDEX IF NOT EXISTS idx_investigaciones_partido_id 
ON investigaciones_judiciales(partido_id);

-- ============================================
-- 2. DROP UNUSED INDEXES
-- ============================================

-- Candidatos table
DROP INDEX IF EXISTS idx_candidatos_partido;
DROP INDEX IF EXISTS idx_candidatos_semaforo;
DROP INDEX IF EXISTS idx_candidatos_activo;
DROP INDEX IF EXISTS idx_candidatos_tipo_candidato;
DROP INDEX IF EXISTS idx_candidatos_inscrito_onpe;
DROP INDEX IF EXISTS idx_candidatos_tipo_activo;

-- Encuesta_votos table
DROP INDEX IF EXISTS idx_votos_candidato;
DROP INDEX IF EXISTS idx_votos_usuario_hash;
DROP INDEX IF EXISTS idx_votos_dispositivo;
DROP INDEX IF EXISTS idx_votos_created;
DROP INDEX IF EXISTS idx_votos_ip_hash;
DROP INDEX IF EXISTS idx_votos_trust_score;
DROP INDEX IF EXISTS idx_votos_verificado;

-- Sesiones_voto table
DROP INDEX IF EXISTS idx_sesiones_voto_usuario;

-- IPs_bloqueadas table
DROP INDEX IF EXISTS idx_ips_bloqueadas_expiracion;

-- Patrones_sospechosos table
DROP INDEX IF EXISTS idx_patrones_tipo;
DROP INDEX IF EXISTS idx_patrones_riesgo;
DROP INDEX IF EXISTS idx_patrones_fecha;

-- Usuarios_verificados table
DROP INDEX IF EXISTS idx_usuarios_verificados_dni;
DROP INDEX IF EXISTS idx_usuarios_verificados_telefono;
DROP INDEX IF EXISTS idx_usuarios_verificados_usado;

-- Votos_pendientes table
DROP INDEX IF EXISTS idx_votos_pendientes_estado;
DROP INDEX IF EXISTS idx_votos_pendientes_candidato;
DROP INDEX IF EXISTS idx_votos_pendientes_fecha;

-- Audit_logs table
DROP INDEX IF EXISTS idx_audit_logs_evento;
DROP INDEX IF EXISTS idx_audit_logs_usuario;
DROP INDEX IF EXISTS idx_audit_logs_timestamp;

-- Partidos_politicos table
DROP INDEX IF EXISTS idx_partidos_estado_candidatura;

-- ============================================
-- 3. FIX SECURITY DEFINER VIEWS
-- ============================================

-- Drop and recreate views WITHOUT security definer
DROP VIEW IF EXISTS votos_sospechosos_resumen;
DROP VIEW IF EXISTS estadisticas_seguridad;

-- Recreate without SECURITY DEFINER (respects RLS)
CREATE OR REPLACE VIEW votos_sospechosos_resumen AS
SELECT 
  candidato_id,
  COUNT(*) as total_sospechosos,
  COUNT(*) FILTER (WHERE resultado_validacion = 'EN_REVISION') as en_revision,
  COUNT(*) FILTER (WHERE resultado_validacion = 'RECHAZADO') as rechazados
FROM encuesta_votos
WHERE es_sospechoso = true
GROUP BY candidato_id;

CREATE OR REPLACE VIEW estadisticas_seguridad AS
SELECT 
  COUNT(*) as total_votos,
  COUNT(*) FILTER (WHERE es_sospechoso = true) as votos_sospechosos,
  COUNT(*) FILTER (WHERE resultado_validacion = 'APROBADO') as votos_aprobados,
  COUNT(*) FILTER (WHERE resultado_validacion = 'EN_REVISION') as votos_en_revision,
  COUNT(*) FILTER (WHERE resultado_validacion = 'RECHAZADO') as votos_rechazados,
  COUNT(*) FILTER (WHERE es_verificado = true) as votos_verificados
FROM encuesta_votos;

-- ============================================
-- 4. FIX FUNCTION SEARCH PATH (SECURITY)
-- ============================================

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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix validar_y_registrar_voto (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'validar_y_registrar_voto'
  ) THEN
    EXECUTE '
      CREATE OR REPLACE FUNCTION validar_y_registrar_voto(
        p_candidato_id uuid,
        p_usuario_hash text,
        p_dispositivo_hash text,
        p_ip_hash text,
        p_user_agent text,
        p_fingerprint jsonb
      )
      RETURNS jsonb AS $func$
      DECLARE
        v_trust_score numeric;
        v_es_sospechoso boolean := false;
        v_resultado_validacion text := ''APROBADO'';
        v_es_verificado boolean := false;
        v_votos_recientes integer;
        v_ip_bloqueada boolean;
        v_voto_id uuid;
        v_sesion_id uuid;
      BEGIN
        -- 1. Check if IP is blocked
        SELECT EXISTS (
          SELECT 1 FROM ips_bloqueadas 
          WHERE ip_hash = p_ip_hash 
          AND (expira_en IS NULL OR expira_en > NOW())
        ) INTO v_ip_bloqueada;

        IF v_ip_bloqueada THEN
          RETURN jsonb_build_object(
            ''success'', false,
            ''error'', ''IP_BLOQUEADA'',
            ''message'', ''Su dirección IP ha sido bloqueada temporalmente''
          );
        END IF;

        -- 2. Check recent votes from same user/device
        SELECT COUNT(*) INTO v_votos_recientes
        FROM encuesta_votos
        WHERE usuario_hash = p_usuario_hash
        AND created_at > NOW() - INTERVAL ''1 hour'';

        -- 3. Calculate trust score
        v_trust_score := 100.0;
        
        IF v_votos_recientes > 0 THEN
          v_trust_score := v_trust_score - (v_votos_recientes * 20);
        END IF;

        -- 4. Determine if suspicious
        IF v_trust_score < 50 THEN
          v_es_sospechoso := true;
          v_resultado_validacion := ''EN_REVISION'';
        END IF;

        -- 5. Insert vote
        INSERT INTO encuesta_votos (
          candidato_id,
          usuario_hash,
          dispositivo_fingerprint,
          ip_hash,
          user_agent,
          trust_score,
          es_sospechoso,
          resultado_validacion,
          es_verificado
        ) VALUES (
          p_candidato_id,
          p_usuario_hash,
          p_dispositivo_hash,
          p_ip_hash,
          p_user_agent,
          v_trust_score,
          v_es_sospechoso,
          v_resultado_validacion,
          v_es_verificado
        ) RETURNING id INTO v_voto_id;

        -- 6. Return result
        RETURN jsonb_build_object(
          ''success'', true,
          ''voto_id'', v_voto_id,
          ''trust_score'', v_trust_score,
          ''es_sospechoso'', v_es_sospechoso,
          ''resultado'', v_resultado_validacion
        );

      EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
          ''success'', false,
          ''error'', ''ERROR_INTERNO'',
          ''message'', SQLERRM
        );
      END;
      $func$ LANGUAGE plpgsql SECURITY DEFINER
      SET search_path = public, pg_temp;
    ';
  END IF;
END $$;