/*
  # Fix Security Issues
  
  ## Changes
  
  ### 1. Fix Function Search Path Vulnerabilities
    - Set immutable search_path on all functions to prevent schema poisoning attacks
    - Forces functions to use the 'public' schema explicitly
  
  ### 2. Remove Security Definer from Views
    - Convert views to normal views without SECURITY DEFINER
    - Safer for read-only aggregation queries
  
  ### 3. Optimize Indexes
    - Keep critical indexes for performance
    - Remove truly redundant indexes
    - Note: "Unused" status is expected in new systems with no traffic
  
  ## Security Impact
  
  - High: Function search path now immutable (prevents SQL injection via schema poisoning)
  - Medium: Views no longer run with elevated privileges
  - Low: Optimized indexes reduce attack surface and improve write performance
*/

-- 1. Fix function search_path vulnerabilities
-- Set explicit search_path for all custom functions

ALTER FUNCTION incrementar_voto_candidato() 
  SET search_path = public, pg_temp;

ALTER FUNCTION obtener_resultados_encuesta() 
  SET search_path = public, pg_temp;

ALTER FUNCTION calcular_trust_score(
  numeric, text, text, text, boolean
) 
  SET search_path = public, pg_temp;

ALTER FUNCTION validar_y_registrar_voto(
  text, text, text, numeric, text, integer, jsonb, boolean
) 
  SET search_path = public, pg_temp;

ALTER FUNCTION detectar_patrones_sospechosos() 
  SET search_path = public, pg_temp;

-- 2. Recreate views without SECURITY DEFINER
-- Drop existing views
DROP VIEW IF EXISTS estadisticas_seguridad;
DROP VIEW IF EXISTS votos_sospechosos_resumen;

-- Recreate estadisticas_seguridad without SECURITY DEFINER
CREATE OR REPLACE VIEW estadisticas_seguridad AS
SELECT 
  COUNT(*) FILTER (WHERE fue_exitoso = true) as votos_exitosos,
  COUNT(*) FILTER (WHERE fue_exitoso = false) as votos_rechazados,
  AVG(trust_score) FILTER (WHERE fue_exitoso = true) as avg_trust_score,
  AVG(recaptcha_score) FILTER (WHERE fue_exitoso = true) as avg_recaptcha_score,
  COUNT(DISTINCT ip_hash) as ips_unicas,
  COUNT(DISTINCT dispositivo_fingerprint) as dispositivos_unicos,
  COUNT(*) FILTER (WHERE intento_timestamp > now() - interval '1 hour') as intentos_ultima_hora
FROM sesiones_voto;

-- Recreate votos_sospechosos_resumen without SECURITY DEFINER
CREATE OR REPLACE VIEW votos_sospechosos_resumen AS
SELECT 
  ev.candidato_id,
  c.nombre_completo as candidato_nombre,
  COUNT(*) as total_votos,
  COUNT(*) FILTER (WHERE ev.trust_score < 50) as votos_bajo_score,
  AVG(ev.trust_score) as avg_trust_score,
  COUNT(DISTINCT ev.ip_hash) as ips_distintas,
  COUNT(DISTINCT ev.dispositivo_fingerprint) as dispositivos_distintos
FROM encuesta_votos ev
JOIN candidatos c ON c.id = ev.candidato_id
GROUP BY ev.candidato_id, c.nombre_completo
ORDER BY votos_bajo_score DESC;

-- 3. Remove redundant indexes while keeping critical ones
-- These are truly redundant as they duplicate functionality

-- Drop redundant indexes on investigaciones_judiciales
-- (tipo_investigacion_preliminar and alcance_familiar are rarely queried alone)
DROP INDEX IF EXISTS idx_investigaciones_tipo_preliminar;
DROP INDEX IF EXISTS idx_investigaciones_alcance_familiar;

-- Drop redundant index on candidatos (investigaciones_familiares rarely used in queries)
DROP INDEX IF EXISTS idx_candidatos_investigaciones_familiares;

-- Drop redundant index on partidos_politicos (semaforo is accessed via candidatos)
DROP INDEX IF EXISTS idx_partidos_semaforo;

-- Drop old rate_limit_control index if table still exists
DROP INDEX IF EXISTS idx_rate_limit_identificador;

-- Drop old audit_log_eventos index if table still exists
DROP INDEX IF EXISTS idx_audit_created;

-- Drop redundant index on investigaciones_judiciales partido_id
-- (foreign key already indexed, rarely queried directly)
DROP INDEX IF EXISTS idx_investigaciones_partido_id;

-- Note: Keep all other indexes as they will be used as the system scales:
-- - candidatos indexes: Used for filtering by partido, semaforo, activo
-- - encuesta_votos indexes: Critical for vote validation and analytics
-- - sesiones_voto indexes: Essential for fraud detection
-- - ips_bloqueadas indexes: Required for fast blocking checks
-- - patrones_sospechosos indexes: Needed for security dashboard
-- - usuarios_verificados indexes: Critical for DNI verification
-- - votos_pendientes indexes: Required for admin review
-- - audit_logs indexes: Essential for compliance and debugging

-- Add comment explaining index usage
COMMENT ON INDEX idx_candidatos_partido IS 
  'Used for filtering candidates by party - critical for user queries';
COMMENT ON INDEX idx_candidatos_semaforo IS 
  'Used for filtering candidates by legal status - high frequency query';
COMMENT ON INDEX idx_candidatos_activo IS 
  'Used for filtering active candidates - every query uses this';
COMMENT ON INDEX idx_votos_candidato IS 
  'Used for vote counting and analytics - critical for performance';
COMMENT ON INDEX idx_votos_usuario_hash IS 
  'Used for duplicate vote detection - security critical';
COMMENT ON INDEX idx_votos_dispositivo IS 
  'Used for device-based fraud detection - security critical';
COMMENT ON INDEX idx_sesiones_voto_ip IS 
  'Used for IP-based rate limiting - fraud prevention critical';
COMMENT ON INDEX idx_ips_bloqueadas_hash IS 
  'Used for fast IP blocking checks - security critical';
COMMENT ON INDEX idx_usuarios_verificados_dni IS 
  'Used for DNI verification lookups - security critical';

-- 4. Add RLS policies for views if needed
-- Views inherit RLS from underlying tables, but we can add explicit policies

-- Grant SELECT on views to authenticated users (read-only)
GRANT SELECT ON estadisticas_seguridad TO authenticated;
GRANT SELECT ON votos_sospechosos_resumen TO authenticated;

-- 5. Final security hardening
-- Ensure all sensitive functions are marked as SECURITY DEFINER where needed
-- and have proper access controls

-- The validar_y_registrar_voto function should be SECURITY DEFINER
-- because it needs to write to restricted tables
ALTER FUNCTION validar_y_registrar_voto(
  text, text, text, numeric, text, integer, jsonb, boolean
) SECURITY DEFINER;

-- Revoke public execute on sensitive functions
REVOKE EXECUTE ON FUNCTION validar_y_registrar_voto(
  text, text, text, numeric, text, integer, jsonb, boolean
) FROM PUBLIC;

-- Grant execute to authenticated and anon (needed for Edge Functions)
GRANT EXECUTE ON FUNCTION validar_y_registrar_voto(
  text, text, text, numeric, text, integer, jsonb, boolean
) TO authenticated, anon;

-- Similarly for detectar_patrones_sospechosos
ALTER FUNCTION detectar_patrones_sospechosos() SECURITY DEFINER;
REVOKE EXECUTE ON FUNCTION detectar_patrones_sospechosos() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION detectar_patrones_sospechosos() TO authenticated;

-- calcular_trust_score is a helper function, keep it as invoker security
-- (it doesn't need elevated privileges)
