/*
  # Agregar Estado de Candidatura para Partidos

  ## Resumen
  Agrega campos para rastrear el estado de las candidaturas presidenciales
  en partidos políticos, especialmente para situaciones de:
  - Primarias internas
  - Candidatos en definición
  - Renuncias de candidatos

  ## Cambios:

  1. Nuevos Campos en `partidos_politicos`
    - `estado_candidatura` (TEXT): Estado actual de la candidatura
      - 'DEFINIDO': Candidato oficial confirmado
      - 'EN_PRIMARIAS': Partido en proceso de primarias internas
      - 'EN_DEFINICION': Candidato en proceso de definición
      - 'SIN_CANDIDATO': Sin candidato designado
    - `candidatos_precandidatos` (JSONB): Lista de precandidatos/candidatos potenciales
    - `fecha_actualizacion_candidatura` (TIMESTAMPTZ): Última actualización del estado
    - `notas_candidatura` (TEXT): Notas adicionales sobre el proceso

  2. Actualizar Casos Específicos
    - Acción Popular: EN_PRIMARIAS (6 listas en competencia)
    - Avanza País: EN_DEFINICION (tras renuncia de Phillip Butters)

  3. Seguridad
    - Se mantienen políticas RLS existentes
*/

-- 1. Agregar campos de estado de candidatura a partidos_politicos
DO $$
BEGIN
  -- Agregar estado_candidatura
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partidos_politicos' AND column_name = 'estado_candidatura'
  ) THEN
    ALTER TABLE partidos_politicos
    ADD COLUMN estado_candidatura TEXT DEFAULT 'DEFINIDO';

    ALTER TABLE partidos_politicos
    ADD CONSTRAINT check_estado_candidatura
    CHECK (estado_candidatura IN ('DEFINIDO', 'EN_PRIMARIAS', 'EN_DEFINICION', 'SIN_CANDIDATO'));
  END IF;

  -- Agregar candidatos_precandidatos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partidos_politicos' AND column_name = 'candidatos_precandidatos'
  ) THEN
    ALTER TABLE partidos_politicos
    ADD COLUMN candidatos_precandidatos JSONB;
  END IF;

  -- Agregar fecha_actualizacion_candidatura
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partidos_politicos' AND column_name = 'fecha_actualizacion_candidatura'
  ) THEN
    ALTER TABLE partidos_politicos
    ADD COLUMN fecha_actualizacion_candidatura TIMESTAMPTZ DEFAULT now();
  END IF;

  -- Agregar notas_candidatura
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'partidos_politicos' AND column_name = 'notas_candidatura'
  ) THEN
    ALTER TABLE partidos_politicos
    ADD COLUMN notas_candidatura TEXT;
  END IF;
END $$;

-- 2. Actualizar Acción Popular: EN_PRIMARIAS
UPDATE partidos_politicos
SET
  estado_candidatura = 'EN_PRIMARIAS',
  candidatos_precandidatos = '[
    {"nombre": "Julio Chávez Chiong", "posicion": "Dirigente actual"},
    {"nombre": "Alfredo Barnechea", "posicion": "Ex candidato presidencial"},
    {"nombre": "Víctor Andrés García Belaúnde", "posicion": "Ex canciller"},
    {"nombre": "Yonhy Lescano", "posicion": "Ex congresista y ex candidato"},
    {"nombre": "Otros precandidatos", "posicion": "2 listas adicionales"}
  ]'::jsonb,
  fecha_actualizacion_candidatura = now(),
  notas_candidatura = 'Acción Popular tiene 6 listas compitiendo en primarias internas para definir candidato presidencial 2026. Proceso democrático interno en curso.'
WHERE nombre = 'Acción Popular';

-- 3. Actualizar Avanza País: EN_DEFINICION
UPDATE partidos_politicos
SET
  estado_candidatura = 'EN_DEFINICION',
  candidatos_precandidatos = '[
    {"nombre": "Phillip Butters", "estado": "RENUNCIÓ", "fecha": "2025-12-05"},
    {"nombre": "José Williams", "posicion": "Posible candidato - Ex ministro de Defensa"}
  ]'::jsonb,
  fecha_actualizacion_candidatura = now(),
  notas_candidatura = 'Phillip Butters renunció el 05/12/2025. Partido en proceso de definir nuevo candidato. Se baraja el nombre de José Williams (ex ministro de Defensa).'
WHERE nombre = 'Avanza País';

-- 4. Crear índice para búsquedas por estado de candidatura
CREATE INDEX IF NOT EXISTS idx_partidos_estado_candidatura
  ON partidos_politicos(estado_candidatura);

-- 5. Comentarios en columnas para documentación
COMMENT ON COLUMN partidos_politicos.estado_candidatura IS
  'Estado actual de la candidatura presidencial: DEFINIDO, EN_PRIMARIAS, EN_DEFINICION, SIN_CANDIDATO';

COMMENT ON COLUMN partidos_politicos.candidatos_precandidatos IS
  'Array JSON con lista de candidatos/precandidatos y su información relevante';

COMMENT ON COLUMN partidos_politicos.fecha_actualizacion_candidatura IS
  'Fecha de última actualización del estado de candidatura';

COMMENT ON COLUMN partidos_politicos.notas_candidatura IS
  'Notas adicionales sobre el proceso de candidatura (renuncias, primarias, etc.)';