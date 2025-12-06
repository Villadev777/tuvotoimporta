/*
  # Agregar Investigaciones Partidarias

  1. Investigaciones de Partidos ROJOS
    - Fuerza Popular: Caso Odebretch, Caja 2
    - Perú Libre: Vladimir Cerrón prófugo, organización criminal
    - Podemos Perú: "Gángsters de la Política", crimen organizado
    - Voces del Pueblo: Terrorismo (Guillermo Bermejo condenado)

  2. Investigaciones de Partidos AMARILLOS
    - Salvemos al Perú: Financiamiento irregular
    - Fuerza Moderna: Irregularidades en financiamiento
    - Renovación Popular: "Caja 2"
    - Nuevo Perú: Financiamiento internacional irregular
    - Acción Popular: Dirigentes anteriores condenados
*/

-- Fuerza Popular
INSERT INTO partidos_politicos_investigaciones (partido_id, tipo_investigacion, descripcion_detallada, organizacion_investigadora, estado_actual, nivel_severidad, fecha_inicio)
SELECT 
  id,
  'CRIMEN_ORGANIZADO',
  'Caso Odebretch: Financiamiento ilegal de campañas políticas a través de sobornos de constructora brasileña. Investigación por lavado de activos y organización criminal.',
  'Fiscalía de la Nación, Equipo Especial Lava Jato',
  'EN_PROCESO',
  5,
  '2017-01-15'::date
FROM partidos_politicos WHERE nombre = 'Fuerza Popular';

INSERT INTO partidos_politicos_investigaciones (partido_id, tipo_investigacion, descripcion_detallada, organizacion_investigadora, estado_actual, nivel_severidad)
SELECT 
  id,
  'FINANCIAMIENTO',
  'Caja 2: Financiamiento no declarado de campañas electorales. Aportes irregulares y no reportados ante ONPE.',
  'ONPE, Fiscalía Anticorrupción',
  'EN_INVESTIGACION',
  4
FROM partidos_politicos WHERE nombre = 'Fuerza Popular';

-- Perú Libre
INSERT INTO partidos_politicos_investigaciones (partido_id, tipo_investigacion, descripcion_detallada, organizacion_investigadora, estado_actual, nivel_severidad, fecha_inicio)
SELECT 
  id,
  'CRIMEN_ORGANIZADO',
  'Vladimir Cerrón (fundador y líder) en condición de PRÓFUGO con más de 500 días sin aparecer. Sentenciado por corrupción. Investigación activa como organización criminal.',
  'Fiscalía de la Nación, PNP',
  'EN_PROCESO',
  5,
  '2023-06-01'::date
FROM partidos_politicos WHERE nombre = 'Perú Libre';

-- Podemos Perú
INSERT INTO partidos_politicos_investigaciones (partido_id, tipo_investigacion, descripcion_detallada, organizacion_investigadora, estado_actual, nivel_severidad, fecha_inicio)
SELECT 
  id,
  'CRIMEN_ORGANIZADO',
  'Caso "Gángsters de la Política": Investigación por organización criminal, compra de voluntades, tráfico de influencias. José Luna Gálvez con arresto domiciliario previo.',
  'Fiscalía Anticorrupción',
  'EN_PROCESO',
  5,
  '2022-03-10'::date
FROM partidos_politicos WHERE nombre = 'Podemos Perú';

-- Voces del Pueblo - TERRORISMO
DO $$
DECLARE
  v_partido_id uuid;
BEGIN
  -- Buscar el partido (puede estar en diferentes nombres o como parte de alianza)
  SELECT id INTO v_partido_id FROM partidos_politicos 
  WHERE nombre LIKE '%Voces del Pueblo%' OR sigla = 'VDP'
  LIMIT 1;

  IF v_partido_id IS NOT NULL THEN
    INSERT INTO partidos_politicos_investigaciones (partido_id, tipo_investigacion, descripcion_detallada, organizacion_investigadora, estado_actual, nivel_severidad, fecha_inicio)
    VALUES (
      v_partido_id,
      'TERRORISMO',
      'Guillermo Bermejo (líder anterior) CONDENADO a 15 años de prisión por terrorismo. Vínculos documentados con grupos terroristas. Partido bajo investigación por conexiones con extremismo.',
      'Poder Judicial, DIRCOTE',
      'SENTENCIADO',
      5,
      '2020-05-15'::date
    );
  END IF;
END $$;

-- Salvemos al Perú
DO $$
DECLARE
  v_partido_id uuid;
BEGIN
  SELECT id INTO v_partido_id FROM partidos_politicos 
  WHERE nombre LIKE '%Salvemos al Perú%'
  LIMIT 1;

  IF v_partido_id IS NOT NULL THEN
    INSERT INTO partidos_politicos_investigaciones (partido_id, tipo_investigacion, descripcion_detallada, organizacion_investigadora, estado_actual, nivel_severidad, fecha_inicio)
    VALUES (
      v_partido_id,
      'FINANCIAMIENTO',
      'Investigación por financiamiento irregular en campaña 2024. Posible lavado de activos en campañas anteriores. En proceso de aclaración con ONPE.',
      'ONPE, Fiscalía',
      'EN_INVESTIGACION',
      3,
      '2024-02-01'::date
    );
  END IF;
END $$;

-- Fuerza Moderna
DO $$
DECLARE
  v_partido_id uuid;
BEGIN
  SELECT id INTO v_partido_id FROM partidos_politicos 
  WHERE nombre LIKE '%Fuerza Moderna%'
  LIMIT 1;

  IF v_partido_id IS NOT NULL THEN
    INSERT INTO partidos_politicos_investigaciones (partido_id, tipo_investigacion, descripcion_detallada, organizacion_investigadora, estado_actual, nivel_severidad, fecha_inicio)
    VALUES (
      v_partido_id,
      'FINANCIAMIENTO',
      'Irregularidades en financiamiento de campañas. Varios dirigentes bajo investigación por lavado de activos. Participación en caso "Caja 2" (2020-2022).',
      'ONPE, Fiscalía Anticorrupción',
      'EN_INVESTIGACION',
      3,
      '2020-08-01'::date
    );
  END IF;
END $$;

-- Renovación Popular
INSERT INTO partidos_politicos_investigaciones (partido_id, tipo_investigacion, descripcion_detallada, organizacion_investigadora, estado_actual, nivel_severidad, fecha_inicio)
SELECT 
  id,
  'FINANCIAMIENTO',
  'Investigación por "Caja 2": Financiamiento no declarado de campañas. Violaciones a normativa de transparencia electoral.',
  'ONPE',
  'EN_INVESTIGACION',
  3,
  '2021-10-01'::date
FROM partidos_politicos WHERE nombre = 'Renovación Popular';

-- Nuevo Perú
INSERT INTO partidos_politicos_investigaciones (partido_id, tipo_investigacion, descripcion_detallada, organizacion_investigadora, estado_actual, nivel_severidad)
SELECT 
  id,
  'FINANCIAMIENTO',
  'Controversias sobre fuentes de financiamiento internacional. Investigación por financiamiento irregular no declarado.',
  'ONPE',
  'EN_INVESTIGACION',
  3
FROM partidos_politicos WHERE nombre = 'Nuevo Perú';

-- Acción Popular
INSERT INTO partidos_politicos_investigaciones (partido_id, tipo_investigacion, descripcion_detallada, organizacion_investigadora, estado_actual, nivel_severidad, fecha_inicio)
SELECT 
  id,
  'OTRO',
  'Historial complejo: Dirigentes anteriores condenados por corrupción en gestiones pasadas. Auditoría interna en curso para saneamiento institucional.',
  'Auditoría Interna, JNE',
  'EN_INVESTIGACION',
  2,
  '2023-01-15'::date
FROM partidos_politicos WHERE nombre = 'Acción Popular';
