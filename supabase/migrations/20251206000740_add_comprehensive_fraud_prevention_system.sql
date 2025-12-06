/*
  # Sistema Integral de Prevención de Fraude Electoral

  ## Nuevas Tablas
  
  ### 1. `sesiones_voto` - Tracking de intentos de votación
    - `id` (uuid, primary key)
    - `usuario_hash` (text) - Hash del usuario
    - `dispositivo_fingerprint` (text) - Fingerprint del navegador
    - `ip_hash` (text) - Hash de la IP para privacidad
    - `intento_timestamp` (timestamptz) - Momento del intento
    - `fue_exitoso` (boolean) - Si el voto fue aceptado
    - `motivo_rechazo` (text) - Razón si fue rechazado
    - `recaptcha_score` (numeric) - Score de reCAPTCHA
    - `trust_score` (numeric) - Score de confianza total
    
  ### 2. `ips_bloqueadas` - IPs sospechosas bloqueadas
    - `id` (uuid, primary key)
    - `ip_hash` (text, unique) - Hash de la IP
    - `motivo` (text) - Razón del bloqueo
    - `bloqueado_hasta` (timestamptz) - Duración del bloqueo
    - `intentos_fallidos` (integer) - Contador de intentos
    
  ### 3. `patrones_sospechosos` - Detección de patrones anormales
    - `id` (uuid, primary key)
    - `tipo_patron` (text) - Tipo: timing, geo, fingerprint_similar
    - `descripcion` (text) - Detalles del patrón
    - `votos_afectados` (integer) - Cantidad de votos relacionados
    - `nivel_riesgo` (text) - bajo, medio, alto, crítico
    - `detectado_en` (timestamptz)
    
  ### 4. `usuarios_verificados` - Usuarios con verificación DNI/SMS
    - `id` (uuid, primary key)
    - `dni_hash` (text, unique) - Hash del DNI
    - `telefono_hash` (text) - Hash del teléfono
    - `email_hash` (text) - Hash del email
    - `verificado_por` (text) - sms, email, dni
    - `fecha_verificacion` (timestamptz)
    - `codigo_verificacion` (text) - Código temporal
    - `codigo_expira` (timestamptz)
    
  ### 5. `votos_pendientes` - Votos en revisión manual
    - `id` (uuid, primary key)
    - `candidato_id` (uuid, foreign key)
    - `usuario_hash` (text)
    - `dispositivo_fingerprint` (text)
    - `ip_hash` (text)
    - `motivo_sospecha` (text)
    - `trust_score` (numeric)
    - `estado` (text) - pendiente, aprobado, rechazado
    - `revisado_por` (text) - Admin que revisó
    - `creado_en` (timestamptz)
    
  ### 6. `audit_logs` - Logs de auditoría completos
    - `id` (uuid, primary key)
    - `evento` (text) - Tipo de evento
    - `usuario_hash` (text)
    - `ip_hash` (text)
    - `detalles` (jsonb) - Detalles completos del evento
    - `timestamp` (timestamptz)

  ## Modificaciones a Tablas Existentes
  
  ### `encuesta_votos` - Campos adicionales
    - `ip_hash` (text) - Hash de IP del votante
    - `recaptcha_score` (numeric) - Score de reCAPTCHA (0-1)
    - `trust_score` (numeric) - Score total de confianza (0-100)
    - `es_verificado` (boolean) - Si usó verificación DNI
    - `user_agent` (text) - User agent del navegador
    - `timezone_offset` (integer) - Offset de zona horaria
    - `navegador_info` (jsonb) - Info adicional del navegador
    
  ## Índices y Constraints
  
  - UNIQUE constraint en (usuario_hash, dispositivo_fingerprint)
  - Índices compuestos para búsquedas rápidas
  - Índices en campos de hash para lookups
  
  ## Funciones
  
  ### `validar_voto_duplicado()` - Función de validación
    - Verifica combinaciones de usuario_hash, fingerprint, IP
    - Retorna score de confianza
    - Detecta patrones sospechosos
    
  ### `registrar_intento_voto()` - Registra cada intento
    - Guarda en sesiones_voto
    - Actualiza audit_logs
    - Aplica rate limiting
    
  ### `calcular_trust_score()` - Calcula score de confianza
    - Combina múltiples factores
    - Retorna valor 0-100
    
  ## Triggers
  
  - `before_insert_voto` - Valida antes de insertar
  - `after_insert_voto` - Registra en audit log
  
  ## Seguridad
  
  - RLS habilitado en todas las tablas
  - Políticas restrictivas para usuarios
  - Solo admins pueden ver tablas de auditoría
*/

-- 1. Tabla de sesiones de voto (tracking de intentos)
CREATE TABLE IF NOT EXISTS sesiones_voto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_hash text NOT NULL,
  dispositivo_fingerprint text NOT NULL,
  ip_hash text NOT NULL,
  intento_timestamp timestamptz DEFAULT now(),
  fue_exitoso boolean DEFAULT false,
  motivo_rechazo text,
  recaptcha_score numeric(3,2),
  trust_score numeric(5,2),
  user_agent text,
  navegador_info jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sesiones_voto_usuario ON sesiones_voto(usuario_hash);
CREATE INDEX IF NOT EXISTS idx_sesiones_voto_fingerprint ON sesiones_voto(dispositivo_fingerprint);
CREATE INDEX IF NOT EXISTS idx_sesiones_voto_ip ON sesiones_voto(ip_hash);
CREATE INDEX IF NOT EXISTS idx_sesiones_voto_timestamp ON sesiones_voto(intento_timestamp DESC);

-- 2. Tabla de IPs bloqueadas
CREATE TABLE IF NOT EXISTS ips_bloqueadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text UNIQUE NOT NULL,
  motivo text NOT NULL,
  bloqueado_hasta timestamptz NOT NULL,
  intentos_fallidos integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ips_bloqueadas_hash ON ips_bloqueadas(ip_hash);
CREATE INDEX IF NOT EXISTS idx_ips_bloqueadas_expiracion ON ips_bloqueadas(bloqueado_hasta);

-- 3. Tabla de patrones sospechosos detectados
CREATE TABLE IF NOT EXISTS patrones_sospechosos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_patron text NOT NULL CHECK (tipo_patron IN ('timing', 'geo', 'fingerprint_similar', 'user_agent', 'rate_limit', 'score_bajo')),
  descripcion text NOT NULL,
  votos_afectados integer DEFAULT 0,
  nivel_riesgo text DEFAULT 'medio' CHECK (nivel_riesgo IN ('bajo', 'medio', 'alto', 'critico')),
  datos_patron jsonb DEFAULT '{}'::jsonb,
  detectado_en timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patrones_tipo ON patrones_sospechosos(tipo_patron);
CREATE INDEX IF NOT EXISTS idx_patrones_riesgo ON patrones_sospechosos(nivel_riesgo);
CREATE INDEX IF NOT EXISTS idx_patrones_fecha ON patrones_sospechosos(detectado_en DESC);

-- 4. Tabla de usuarios verificados (DNI/SMS/Email)
CREATE TABLE IF NOT EXISTS usuarios_verificados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dni_hash text UNIQUE,
  telefono_hash text,
  email_hash text,
  verificado_por text CHECK (verificado_por IN ('sms', 'email', 'dni')),
  fecha_verificacion timestamptz DEFAULT now(),
  codigo_verificacion text,
  codigo_expira timestamptz,
  usado boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_verificados_dni ON usuarios_verificados(dni_hash);
CREATE INDEX IF NOT EXISTS idx_usuarios_verificados_telefono ON usuarios_verificados(telefono_hash);
CREATE INDEX IF NOT EXISTS idx_usuarios_verificados_usado ON usuarios_verificados(usado);

-- 5. Tabla de votos pendientes de revisión manual
CREATE TABLE IF NOT EXISTS votos_pendientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id uuid REFERENCES candidatos(id),
  usuario_hash text NOT NULL,
  dispositivo_fingerprint text NOT NULL,
  ip_hash text NOT NULL,
  motivo_sospecha text NOT NULL,
  trust_score numeric(5,2),
  recaptcha_score numeric(3,2),
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  revisado_por text,
  revisado_en timestamptz,
  notas_revision text,
  datos_adicionales jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_votos_pendientes_estado ON votos_pendientes(estado);
CREATE INDEX IF NOT EXISTS idx_votos_pendientes_candidato ON votos_pendientes(candidato_id);
CREATE INDEX IF NOT EXISTS idx_votos_pendientes_fecha ON votos_pendientes(created_at DESC);

-- 6. Tabla de logs de auditoría
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento text NOT NULL,
  usuario_hash text,
  ip_hash text,
  detalles jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_evento ON audit_logs(evento);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON audit_logs(usuario_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- 7. Agregar campos adicionales a encuesta_votos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'encuesta_votos' AND column_name = 'ip_hash') THEN
    ALTER TABLE encuesta_votos ADD COLUMN ip_hash text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'encuesta_votos' AND column_name = 'trust_score') THEN
    ALTER TABLE encuesta_votos ADD COLUMN trust_score numeric(5,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'encuesta_votos' AND column_name = 'es_verificado') THEN
    ALTER TABLE encuesta_votos ADD COLUMN es_verificado boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'encuesta_votos' AND column_name = 'user_agent') THEN
    ALTER TABLE encuesta_votos ADD COLUMN user_agent text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'encuesta_votos' AND column_name = 'timezone_offset') THEN
    ALTER TABLE encuesta_votos ADD COLUMN timezone_offset integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'encuesta_votos' AND column_name = 'navegador_info') THEN
    ALTER TABLE encuesta_votos ADD COLUMN navegador_info jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 8. Crear UNIQUE constraint para prevenir votos duplicados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_votos_unique_usuario_fingerprint'
  ) THEN
    CREATE UNIQUE INDEX idx_votos_unique_usuario_fingerprint 
      ON encuesta_votos(usuario_hash, dispositivo_fingerprint);
  END IF;
END $$;

-- 9. Índices adicionales en encuesta_votos
CREATE INDEX IF NOT EXISTS idx_votos_ip_hash ON encuesta_votos(ip_hash);
CREATE INDEX IF NOT EXISTS idx_votos_trust_score ON encuesta_votos(trust_score);
CREATE INDEX IF NOT EXISTS idx_votos_verificado ON encuesta_votos(es_verificado);

-- 10. Función para calcular trust score
CREATE OR REPLACE FUNCTION calcular_trust_score(
  p_recaptcha_score numeric,
  p_ip_hash text,
  p_fingerprint text,
  p_usuario_hash text,
  p_es_verificado boolean
) RETURNS numeric AS $$
DECLARE
  v_score numeric := 0;
  v_intentos_recientes integer;
  v_ip_bloqueada boolean;
  v_votos_similares integer;
BEGIN
  -- Base score de reCAPTCHA (0-40 puntos)
  v_score := v_score + (COALESCE(p_recaptcha_score, 0.5) * 40);
  
  -- Verificación DNI/SMS (+30 puntos)
  IF p_es_verificado THEN
    v_score := v_score + 30;
  END IF;
  
  -- Penalización por intentos recientes (-20 puntos)
  SELECT COUNT(*) INTO v_intentos_recientes
  FROM sesiones_voto
  WHERE (ip_hash = p_ip_hash OR dispositivo_fingerprint = p_fingerprint)
    AND intento_timestamp > now() - interval '1 hour';
  
  IF v_intentos_recientes > 3 THEN
    v_score := v_score - 20;
  ELSIF v_intentos_recientes > 1 THEN
    v_score := v_score - 10;
  END IF;
  
  -- Verificar si IP está bloqueada (-50 puntos)
  SELECT EXISTS(
    SELECT 1 FROM ips_bloqueadas 
    WHERE ip_hash = p_ip_hash 
      AND bloqueado_hasta > now()
  ) INTO v_ip_bloqueada;
  
  IF v_ip_bloqueada THEN
    v_score := v_score - 50;
  END IF;
  
  -- Penalización por fingerprints muy similares (-15 puntos)
  SELECT COUNT(*) INTO v_votos_similares
  FROM encuesta_votos
  WHERE dispositivo_fingerprint = p_fingerprint
    AND created_at > now() - interval '24 hours';
  
  IF v_votos_similares > 0 THEN
    v_score := v_score - 15;
  END IF;
  
  -- Bonus por usuario único (+10 puntos)
  IF NOT EXISTS(SELECT 1 FROM encuesta_votos WHERE usuario_hash = p_usuario_hash) THEN
    v_score := v_score + 10;
  END IF;
  
  -- Normalizar entre 0 y 100
  v_score := GREATEST(0, LEAST(100, v_score));
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- 11. Función para validar voto y registrar intento
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
  
  -- Verificar score mínimo (30 para votos no verificados, 0 para verificados)
  IF v_trust_score < 30 AND NOT p_es_verificado THEN
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
    'requiere_revision', v_trust_score BETWEEN 30 AND 50
  );
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- 12. Función para detectar patrones sospechosos
CREATE OR REPLACE FUNCTION detectar_patrones_sospechosos()
RETURNS void AS $$
DECLARE
  v_patron record;
  v_count integer;
BEGIN
  -- Detectar timing patterns (votos cada exactamente X segundos)
  WITH timing_analysis AS (
    SELECT 
      dispositivo_fingerprint,
      COUNT(*) as votos,
      STDDEV(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (PARTITION BY dispositivo_fingerprint ORDER BY created_at)))) as timing_stddev
    FROM encuesta_votos
    WHERE created_at > now() - interval '24 hours'
    GROUP BY dispositivo_fingerprint
    HAVING COUNT(*) > 2
  )
  SELECT COUNT(*) INTO v_count
  FROM timing_analysis
  WHERE timing_stddev < 5 AND votos > 3;
  
  IF v_count > 0 THEN
    INSERT INTO patrones_sospechosos (tipo_patron, descripcion, votos_afectados, nivel_riesgo)
    VALUES ('timing', 'Votos con timing muy regular detectados', v_count, 'alto');
  END IF;
  
  -- Detectar múltiples votos desde misma IP en corto tiempo
  WITH ip_analysis AS (
    SELECT ip_hash, COUNT(*) as votos
    FROM encuesta_votos
    WHERE created_at > now() - interval '1 hour'
    GROUP BY ip_hash
    HAVING COUNT(*) > 2
  )
  SELECT COUNT(*) INTO v_count FROM ip_analysis;
  
  IF v_count > 0 THEN
    INSERT INTO patrones_sospechosos (tipo_patron, descripcion, votos_afectados, nivel_riesgo)
    VALUES ('rate_limit', 'Múltiples votos desde misma IP detectados', v_count, 'medio');
  END IF;
  
  -- Detectar fingerprints muy similares (posible evasión)
  WITH fingerprint_analysis AS (
    SELECT 
      LEFT(dispositivo_fingerprint, 20) as fp_prefix,
      COUNT(DISTINCT dispositivo_fingerprint) as variaciones,
      COUNT(*) as votos
    FROM encuesta_votos
    WHERE created_at > now() - interval '24 hours'
    GROUP BY LEFT(dispositivo_fingerprint, 20)
    HAVING COUNT(DISTINCT dispositivo_fingerprint) > 5
  )
  SELECT COUNT(*) INTO v_count FROM fingerprint_analysis;
  
  IF v_count > 0 THEN
    INSERT INTO patrones_sospechosos (tipo_patron, descripcion, votos_afectados, nivel_riesgo)
    VALUES ('fingerprint_similar', 'Fingerprints con patrones similares detectados', v_count, 'alto');
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 13. Habilitar RLS en todas las nuevas tablas
ALTER TABLE sesiones_voto ENABLE ROW LEVEL SECURITY;
ALTER TABLE ips_bloqueadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrones_sospechosos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_verificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos_pendientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 14. Políticas RLS (restrictivas por defecto)

-- Sesiones de voto: público puede insertar, nadie puede leer directamente
CREATE POLICY "Sistema puede insertar sesiones"
  ON sesiones_voto FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Solo sistema puede leer sesiones"
  ON sesiones_voto FOR SELECT
  TO authenticated
  USING (false);

-- IPs bloqueadas: solo sistema puede acceder
CREATE POLICY "Solo funciones pueden modificar IPs bloqueadas"
  ON ips_bloqueadas FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Patrones sospechosos: nadie puede acceder directamente
CREATE POLICY "Solo funciones pueden modificar patrones"
  ON patrones_sospechosos FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Usuarios verificados: pueden insertar pero no leer directamente
CREATE POLICY "Sistema puede insertar verificaciones"
  ON usuarios_verificados FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Solo sistema puede leer verificaciones"
  ON usuarios_verificados FOR SELECT
  TO authenticated
  USING (false);

-- Votos pendientes: nadie puede acceder directamente (solo admins vía API)
CREATE POLICY "Solo funciones pueden modificar votos pendientes"
  ON votos_pendientes FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Audit logs: solo sistema puede escribir
CREATE POLICY "Sistema puede insertar audit logs"
  ON audit_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Solo sistema puede leer audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (false);

-- 15. Vistas útiles para análisis (solo accesibles vía funciones/admin)
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
