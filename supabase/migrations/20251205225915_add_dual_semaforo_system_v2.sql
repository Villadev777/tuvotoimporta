/*
  # Sistema de Semáforo Dual (Candidato + Partido)

  1. Modificaciones a Tablas Existentes
    - `partidos_politicos`: Agregar campos para semáforo partidario
      - `estado_semaforo_partidario` (VERDE|AMARILLO|ROJO)
      - `tiene_investigacion_colectiva` (BOOLEAN)
      - `tipo_investigacion_partidaria` (TEXT)
    
    - `investigaciones_judiciales`: Expandir para investigaciones partidarias
      - Hacer `candidato_id` NULLABLE (para investigaciones sin candidato)
      - Agregar `partido_id` (NULLABLE)
      - Agregar `alcance` (INDIVIDUAL|COLECTIVO|MIXTO)
      - Agregar `liderazgo_afectado` (TEXT)

  2. Nueva Tabla
    - `partidos_politicos_investigaciones`: Tabla dedicada para investigaciones partidarias

  3. Seguridad
    - RLS habilitado en nueva tabla
    - Políticas de lectura pública
*/

-- 1. Expandir partidos_politicos
DO $$
BEGIN
  -- Agregar estado_semaforo_partidario
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partidos_politicos' AND column_name = 'estado_semaforo_partidario'
  ) THEN
    ALTER TABLE partidos_politicos 
    ADD COLUMN estado_semaforo_partidario TEXT DEFAULT 'VERDE';
    
    ALTER TABLE partidos_politicos
    ADD CONSTRAINT check_estado_semaforo_partidario 
    CHECK (estado_semaforo_partidario IN ('VERDE', 'AMARILLO', 'ROJO'));
  END IF;

  -- Agregar tiene_investigacion_colectiva
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partidos_politicos' AND column_name = 'tiene_investigacion_colectiva'
  ) THEN
    ALTER TABLE partidos_politicos 
    ADD COLUMN tiene_investigacion_colectiva BOOLEAN DEFAULT false;
  END IF;

  -- Agregar tipo_investigacion_partidaria
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'partidos_politicos' AND column_name = 'tipo_investigacion_partidaria'
  ) THEN
    ALTER TABLE partidos_politicos 
    ADD COLUMN tipo_investigacion_partidaria TEXT;
  END IF;
END $$;

-- 2. Expandir investigaciones_judiciales
DO $$
BEGIN
  -- Hacer candidato_id NULLABLE si aún no lo es
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'investigaciones_judiciales' 
    AND column_name = 'candidato_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE investigaciones_judiciales 
    ALTER COLUMN candidato_id DROP NOT NULL;
  END IF;

  -- Agregar partido_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'investigaciones_judiciales' AND column_name = 'partido_id'
  ) THEN
    ALTER TABLE investigaciones_judiciales 
    ADD COLUMN partido_id UUID REFERENCES partidos_politicos(id) ON DELETE CASCADE;
  END IF;

  -- Agregar alcance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'investigaciones_judiciales' AND column_name = 'alcance'
  ) THEN
    ALTER TABLE investigaciones_judiciales 
    ADD COLUMN alcance TEXT DEFAULT 'INDIVIDUAL';
    
    ALTER TABLE investigaciones_judiciales
    ADD CONSTRAINT check_alcance 
    CHECK (alcance IN ('INDIVIDUAL', 'COLECTIVO', 'MIXTO'));
  END IF;

  -- Agregar liderazgo_afectado
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'investigaciones_judiciales' AND column_name = 'liderazgo_afectado'
  ) THEN
    ALTER TABLE investigaciones_judiciales 
    ADD COLUMN liderazgo_afectado TEXT;
  END IF;
END $$;

-- 3. Crear tabla partidos_politicos_investigaciones
CREATE TABLE IF NOT EXISTS partidos_politicos_investigaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id UUID NOT NULL REFERENCES partidos_politicos(id) ON DELETE CASCADE,
  tipo_investigacion TEXT NOT NULL,
  descripcion_detallada TEXT NOT NULL,
  organizacion_investigadora TEXT,
  fecha_inicio DATE,
  fecha_actualizacion TIMESTAMPTZ DEFAULT now(),
  estado_actual TEXT NOT NULL,
  nivel_severidad INTEGER CHECK (nivel_severidad BETWEEN 1 AND 5),
  url_verificacion TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT check_tipo_investigacion CHECK (tipo_investigacion IN ('FINANCIAMIENTO', 'CRIMEN_ORGANIZADO', 'TERRORISMO', 'OTRO')),
  CONSTRAINT check_estado_actual CHECK (estado_actual IN ('EN_INVESTIGACION', 'EN_PROCESO', 'SENTENCIADO', 'ARCHIVADO'))
);

-- Habilitar RLS
ALTER TABLE partidos_politicos_investigaciones ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'partidos_politicos_investigaciones' 
    AND policyname = 'Permitir lectura pública de investigaciones partidarias'
  ) THEN
    CREATE POLICY "Permitir lectura pública de investigaciones partidarias"
      ON partidos_politicos_investigaciones
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_investigaciones_partido_id 
  ON investigaciones_judiciales(partido_id) 
  WHERE partido_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_partidos_investigaciones_partido 
  ON partidos_politicos_investigaciones(partido_id);

CREATE INDEX IF NOT EXISTS idx_partidos_semaforo 
  ON partidos_politicos(estado_semaforo_partidario);
