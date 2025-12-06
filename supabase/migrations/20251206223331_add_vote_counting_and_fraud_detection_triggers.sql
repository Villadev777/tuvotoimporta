/*
  # Sistema de Conteo Automático y Detección de Fraude Instantánea

  ## Cambios Implementados

  ### 1. Funciones Nuevas
  - `incrementar_voto_candidato()`: Función trigger que incrementa automáticamente el contador de votos
    - Solo cuenta votos con resultado_validacion = 'APROBADO'
    - Actualiza la columna total_votos en la tabla candidatos
    - Ejecuta con SECURITY DEFINER para permisos elevados
  
  - `analizar_patron_fraude_instantaneo()`: Detección de fraude en tiempo real
    - Detecta "ráfagas veloces" (Speed Burst): más de 10 votos por segundo
    - Marca votos sospechosos automáticamente
    - Cambia estado a 'EN_REVISION' para votos anómalos
    - Se ejecuta ANTES de insertar el voto

  ### 2. Triggers Configurados
  - `on_voto_added`: Se dispara DESPUÉS de insertar un voto (AFTER INSERT)
    - Llama a incrementar_voto_candidato()
    - Actualiza contadores en tiempo real
  
  - `check_fraud_before_insert`: Se dispara ANTES de insertar un voto (BEFORE INSERT)
    - Llama a analizar_patron_fraude_instantaneo()
    - Previene fraude antes de que el voto se guarde

  ### 3. Corrección de Datos
  - Recalcula totales de votos para todos los candidatos
  - Resetea contadores a 0
  - Cuenta solo votos APROBADOS
  - Asegura integridad de datos existentes

  ## Beneficios de Seguridad
  - Prevención automática de ataques de velocidad
  - Conteo preciso y confiable
  - Sistema reactivo ante comportamiento anómalo
  - Auditoría automática de patrones sospechosos
*/

-- 1. Function to safely increment vote count
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger for Counting
DROP TRIGGER IF EXISTS on_voto_added ON encuesta_votos;

CREATE TRIGGER on_voto_added
AFTER INSERT ON encuesta_votos
FOR EACH ROW
EXECUTE FUNCTION incrementar_voto_candidato();

-- 3. New Advanced Fraud Detection Function (Trigger)
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
    -- Opcional: Podríamos insertar en alertas
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar el análisis ANTES de insertar
DROP TRIGGER IF EXISTS check_fraud_before_insert ON encuesta_votos;

CREATE TRIGGER check_fraud_before_insert
BEFORE INSERT ON encuesta_votos
FOR EACH ROW
EXECUTE FUNCTION analizar_patron_fraude_instantaneo();

-- 4. Data Correction: Recalculate totals for all candidates
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Reset all counts to 0 first
  UPDATE candidatos SET total_votos = 0;
  
  -- Update with actual counts
  FOR r IN 
    SELECT candidato_id, COUNT(*) as total
    FROM encuesta_votos
    WHERE resultado_validacion = 'APROBADO'
    GROUP BY candidato_id
  LOOP
    UPDATE candidatos 
    SET total_votos = r.total 
    WHERE id = r.candidato_id;
  END LOOP;
END $$;