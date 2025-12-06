/*
  # Corrección Integral de Candidatos 2026 - Alineación con ONPE

  ## Resumen
  Esta migración corrige inconsistencias críticas entre los datos actuales y la lista oficial
  de precandidatos ONPE 2026. Implementa un sistema de clasificación que distingue entre
  precandidatos oficiales, referencias históricas y candidatos fuera de carrera.

  ## 1. Nuevos Campos en `candidatos`
    - `tipo_candidato` (TEXT): Clasificación del tipo de candidato
      - 'PRECANDIDATO_OFICIAL': Inscrito formalmente ante ONPE 2026
      - 'REFERENCIA_HISTORICA': Figura política relevante, no inscrito como precandidato
      - 'FUERA_DE_CARRERA': Inhabilitado o retirado de la contienda
      - 'EN_DEFINICION': Partido en proceso de definir candidato
    - `inscrito_onpe` (BOOLEAN): Indica si está inscrito oficialmente ante ONPE
    - `notas_clasificacion` (TEXT): Notas sobre su clasificación y situación

  ## 2. Correcciones de Partidos y Alianzas
    - Nicanor Boluarte: Cambiar de "Avanza País" a "Ciudadanos por el Perú"
    - Roberto Chiabra: Ya está correcto en "Unidad Nacional" (alianza)
    - Alfonso López Chau: Ya está correcto en "Ahora Nación"
    - Carlos Álvarez: Ya está correcto en "País para Todos"

  ## 3. Correcciones de Estado de Semáforo
    - César Acuña: Ya está en AMARILLO (correcto), actualizar investigaciones

  ## 4. Resolución de Duplicidades
    - Podemos Perú: José Luna Gálvez es el precandidato oficial
    - Daniel Urresti: Marcar como referencia histórica, no precandidato actual

  ## 5. Candidatos Inactivos/Fuera de Carrera
    - Antauro Humala: Ya marcado como inactivo (organización ilegal)
    - Phillip Butters: Ya marcado como inactivo (renunció)

  ## 6. Clasificación de Candidatos
    Precandidatos Oficiales ONPE (inscrito_onpe = true):
    - José Luna Gálvez, Keiko Fujimori, César Acuña, Rafael López Aliaga,
      Waldemar Cerrón, Ronald Atencio, George Forsyth, Roberto Chiabra,
      Carlos Álvarez, Nicanor Boluarte, Morgan Quero, y otros con inscripción confirmada

    Referencias Históricas (inscrito_onpe = false):
    - Verónika Mendoza, Marco Arana, Yonhy Lescano, Alberto Beingolea,
      Hernando de Soto, Daniel Urresti, Daniel Salaverry

  ## 7. Actualización de Investigaciones
    - César Acuña: Agregar investigaciones familiares (hermano Óscar Acuña)

  ## 8. Seguridad
    - Se mantienen todas las políticas RLS existentes
    - Nuevos campos con valores por defecto seguros
*/

-- 1. Agregar nuevos campos de clasificación
DO $$
BEGIN
  -- Agregar tipo_candidato
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidatos' AND column_name = 'tipo_candidato'
  ) THEN
    ALTER TABLE candidatos
    ADD COLUMN tipo_candidato TEXT DEFAULT 'PRECANDIDATO_OFICIAL';

    ALTER TABLE candidatos
    ADD CONSTRAINT check_tipo_candidato
    CHECK (tipo_candidato IN (
      'PRECANDIDATO_OFICIAL',
      'REFERENCIA_HISTORICA',
      'FUERA_DE_CARRERA',
      'EN_DEFINICION'
    ));
  END IF;

  -- Agregar inscrito_onpe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidatos' AND column_name = 'inscrito_onpe'
  ) THEN
    ALTER TABLE candidatos
    ADD COLUMN inscrito_onpe BOOLEAN DEFAULT true;
  END IF;

  -- Agregar notas_clasificacion
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidatos' AND column_name = 'notas_clasificacion'
  ) THEN
    ALTER TABLE candidatos
    ADD COLUMN notas_clasificacion TEXT;
  END IF;
END $$;

-- 2. Corregir partido de Nicanor Boluarte
UPDATE candidatos
SET
  partido_id = (SELECT id FROM partidos_politicos WHERE nombre = 'Ciudadanos por el Perú' LIMIT 1),
  notas_clasificacion = 'Nicanor Boluarte lidera Ciudadanos por el Perú, su propio partido recién inscrito. No está vinculado a Avanza País.'
WHERE nombre_completo = 'Nicanor Boluarte';

-- 3. Actualizar investigaciones de César Acuña
UPDATE candidatos
SET
  tiene_investigaciones_familiares = true,
  riesgo_reputacional_descripcion = 'Investigaciones preliminares: contratos de publicidad irregular, gestión cuestionada en La Libertad. Riesgo reputacional significativo: su hermano Óscar Acuña está siendo investigado por presunta organización criminal. Estos vínculos familiares representan un riesgo reputacional importante aunque César Acuña no esté directamente implicado.'
WHERE nombre_completo = 'César Acuña Peralta';

-- 4. Resolver duplicidad Podemos Perú
-- Daniel Urresti: Marcar como referencia histórica
UPDATE candidatos
SET
  tipo_candidato = 'REFERENCIA_HISTORICA',
  inscrito_onpe = false,
  notas_clasificacion = 'Figura histórica asociada a Podemos Perú. Para 2026, el precandidato presidencial oficial inscrito es José Luna Gálvez. Urresti no está inscrito como precandidato para estas elecciones.'
WHERE nombre_completo = 'Daniel Urresti';

-- José Luna Gálvez: Confirmar como precandidato oficial
UPDATE candidatos
SET
  tipo_candidato = 'PRECANDIDATO_OFICIAL',
  inscrito_onpe = true,
  notas_clasificacion = 'Precandidato presidencial oficial de Podemos Perú inscrito ante ONPE para elecciones 2026.'
WHERE nombre_completo = 'José Luna Gálvez';

-- 5. Marcar candidatos fuera de carrera
UPDATE candidatos
SET
  tipo_candidato = 'FUERA_DE_CARRERA',
  inscrito_onpe = false,
  notas_clasificacion = 'Organización política A.N.T.A.U.R.O declarada ilegal y disuelta. Antauro Humala no puede participar en las elecciones 2026.'
WHERE nombre_completo = 'Antauro Humala';

UPDATE candidatos
SET
  tipo_candidato = 'FUERA_DE_CARRERA',
  inscrito_onpe = false,
  notas_clasificacion = 'Renunció a la candidatura presidencial de Avanza País el 05/12/2025. Fuera de la carrera electoral.'
WHERE nombre_completo = 'Phillip Butters';

-- 6. Clasificar candidatos como PRECANDIDATO_OFICIAL (inscritos ONPE)
UPDATE candidatos
SET
  tipo_candidato = 'PRECANDIDATO_OFICIAL',
  inscrito_onpe = true,
  notas_clasificacion = 'Precandidato presidencial oficial inscrito ante ONPE 2026.'
WHERE nombre_completo IN (
  'Keiko Fujimori',
  'César Acuña Peralta',
  'Rafael López Aliaga',
  'Waldemar Cerrón',
  'Ronald Atencio',
  'George Forsyth',
  'Roberto Chiabra León',
  'Carlos Álvarez Escobar',
  'Morgan Quero',
  'Wolfgang Grozo',
  'Napoleón Becerra',
  'Alex González',
  'Roberto Sánchez',
  'Fiorella Molinelli',
  'Mario Vizcarra',
  'Carlos Neuhaus'
)
AND activo = true;

-- 7. Clasificar como REFERENCIA_HISTORICA (no inscritos como precandidatos 2026)
UPDATE candidatos
SET
  tipo_candidato = 'REFERENCIA_HISTORICA',
  inscrito_onpe = false,
  notas_clasificacion = 'Figura política relevante histórica. No aparece como precandidato presidencial inscrito ante ONPE para elecciones 2026. Puede ser candidato de referencia para análisis político.'
WHERE nombre_completo IN (
  'Verónika Mendoza',
  'Marco Arana',
  'Yonhy Lescano',
  'Alberto Beingolea',
  'Daniel Salaverry'
)
AND activo = true;

-- 8. Casos especiales: Hernando de Soto y Progresemos
UPDATE candidatos
SET
  tipo_candidato = 'REFERENCIA_HISTORICA',
  inscrito_onpe = false,
  notas_clasificacion = 'Progresemos tiene como precandidato presidencial oficial a Jaimes Blanco según ONPE. Hernando de Soto es la figura histórica del partido pero no es el precandidato inscrito para 2026.'
WHERE nombre_completo = 'Hernando de Soto';

-- 9. Acción Popular: Candidatos en primarias internas
UPDATE candidatos
SET
  tipo_candidato = 'EN_DEFINICION',
  inscrito_onpe = false,
  notas_clasificacion = 'Acción Popular tiene 6 listas en primarias internas. Este candidato es uno de los precandidatos en competencia, pero el partido aún no ha definido su candidato oficial.'
WHERE nombre_completo IN (
  'Julio Chávez Chiong',
  'Alfredo Barnechea',
  'Víctor Andrés García Belaúnde'
)
AND activo = true;

-- 10. Actualizar George Forsyth con nota administrativa
UPDATE candidatos
SET
  notas_clasificacion = 'Precandidato oficial ante ONPE. Tiene algunos procesos administrativos menores (casos administrativos, arbitrajes) pero sin investigaciones penales graves. Semáforo verde se mantiene según criterio LUKIA.'
WHERE nombre_completo = 'George Forsyth';

-- 11. Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_candidatos_tipo_candidato
  ON candidatos(tipo_candidato);

CREATE INDEX IF NOT EXISTS idx_candidatos_inscrito_onpe
  ON candidatos(inscrito_onpe);

CREATE INDEX IF NOT EXISTS idx_candidatos_tipo_activo
  ON candidatos(tipo_candidato, activo);

-- 12. Agregar comentarios para documentación
COMMENT ON COLUMN candidatos.tipo_candidato IS
  'Clasificación del tipo de candidato: PRECANDIDATO_OFICIAL (inscrito ONPE), REFERENCIA_HISTORICA (figura relevante no inscrito), FUERA_DE_CARRERA (inhabilitado/retirado), EN_DEFINICION (partido en primarias)';

COMMENT ON COLUMN candidatos.inscrito_onpe IS
  'Indica si el candidato está oficialmente inscrito como precandidato presidencial ante ONPE para elecciones 2026';

COMMENT ON COLUMN candidatos.notas_clasificacion IS
  'Notas explicativas sobre la clasificación del candidato y su situación actual en la carrera electoral';
