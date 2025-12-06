/*
  # Agregar Campos de Riesgo Reputacional e Investigaciones Familiares

  1. Nuevos Campos en candidatos
    - `tiene_investigaciones_familiares` (BOOLEAN): Si tiene familiares investigados
    - `riesgo_reputacional_descripcion` (TEXT): Descripción del riesgo reputacional

  2. Nuevos Campos en partidos_politicos
    - `riesgo_reputacional_historico` (TEXT): Historial de candidatos investigados

  3. Nuevos Campos en investigaciones_judiciales
    - Expandir tipo para incluir 'PRELIMINAR'
    - Expandir alcance para incluir 'FAMILIAR'
    - Agregar `afecta_candidatura` (BOOLEAN)

  4. Nuevos Campos en partidos_politicos_investigaciones
    - `candidatos_historicos_investigados` (JSONB): Lista de candidatos con antecedentes
*/

-- 1. Expandir tabla candidatos
DO $$
BEGIN
  -- Agregar tiene_investigaciones_familiares
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidatos' AND column_name = 'tiene_investigaciones_familiares'
  ) THEN
    ALTER TABLE candidatos 
    ADD COLUMN tiene_investigaciones_familiares BOOLEAN DEFAULT false;
  END IF;

  -- Agregar riesgo_reputacional_descripcion
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidatos' AND column_name = 'riesgo_reputacional_descripcion'
  ) THEN
    ALTER TABLE candidatos 
    ADD COLUMN riesgo_reputacional_descripcion TEXT;
  END IF;
END $$;

-- 2. Expandir tabla partidos_politicos
DO $$
BEGIN
  -- Agregar riesgo_reputacional_historico
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partidos_politicos' AND column_name = 'riesgo_reputacional_historico'
  ) THEN
    ALTER TABLE partidos_politicos 
    ADD COLUMN riesgo_reputacional_historico TEXT;
  END IF;
END $$;

-- 3. Expandir tabla investigaciones_judiciales
DO $$
BEGIN
  -- Primero eliminar constraint existente si existe
  ALTER TABLE investigaciones_judiciales 
  DROP CONSTRAINT IF EXISTS investigaciones_judiciales_tipo_check;
  
  -- Agregar nuevo constraint con PRELIMINAR
  ALTER TABLE investigaciones_judiciales
  ADD CONSTRAINT investigaciones_judiciales_tipo_check 
  CHECK (tipo IN ('PENAL', 'ADMINISTRATIVA', 'CIVIL', 'COLECTIVA', 'PRELIMINAR'));

  -- Eliminar constraint de alcance si existe
  ALTER TABLE investigaciones_judiciales 
  DROP CONSTRAINT IF EXISTS check_alcance;
  
  -- Agregar nuevo constraint con FAMILIAR
  ALTER TABLE investigaciones_judiciales
  ADD CONSTRAINT check_alcance 
  CHECK (alcance IN ('INDIVIDUAL', 'COLECTIVO', 'MIXTO', 'FAMILIAR'));

  -- Agregar afecta_candidatura
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'investigaciones_judiciales' AND column_name = 'afecta_candidatura'
  ) THEN
    ALTER TABLE investigaciones_judiciales 
    ADD COLUMN afecta_candidatura BOOLEAN DEFAULT true;
  END IF;
END $$;

-- 4. Expandir tabla partidos_politicos_investigaciones
DO $$
BEGIN
  -- Eliminar constraint existente si existe
  ALTER TABLE partidos_politicos_investigaciones 
  DROP CONSTRAINT IF EXISTS check_tipo_investigacion;
  
  -- Agregar nuevo constraint con CORRUPCION_REGIONAL
  ALTER TABLE partidos_politicos_investigaciones
  ADD CONSTRAINT check_tipo_investigacion 
  CHECK (tipo_investigacion IN ('FINANCIAMIENTO', 'CRIMEN_ORGANIZADO', 'TERRORISMO', 'CORRUPCION_REGIONAL', 'OTRO'));

  -- Agregar candidatos_historicos_investigados
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partidos_politicos_investigaciones' AND column_name = 'candidatos_historicos_investigados'
  ) THEN
    ALTER TABLE partidos_politicos_investigaciones 
    ADD COLUMN candidatos_historicos_investigados JSONB;
  END IF;
END $$;

-- Crear índices para nuevos campos
CREATE INDEX IF NOT EXISTS idx_candidatos_investigaciones_familiares 
  ON candidatos(tiene_investigaciones_familiares) 
  WHERE tiene_investigaciones_familiares = true;

CREATE INDEX IF NOT EXISTS idx_investigaciones_tipo_preliminar 
  ON investigaciones_judiciales(tipo) 
  WHERE tipo = 'PRELIMINAR';

CREATE INDEX IF NOT EXISTS idx_investigaciones_alcance_familiar 
  ON investigaciones_judiciales(alcance) 
  WHERE alcance = 'FAMILIAR';
