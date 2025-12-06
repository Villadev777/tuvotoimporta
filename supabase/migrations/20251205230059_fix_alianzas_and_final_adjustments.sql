/*
  # Ajustes Finales de Alianzas y Candidatos Críticos

  1. Agregar Investigaciones para Alianzas
    - Venceremos: Incluye Voces del Pueblo (terrorismo)
    - Fuerza y Libertad: Incluye Batalla Perú (crimen organizado)

  2. Agregar Investigaciones Faltantes de Candidatos
    - Daniel Urresti: Caso Madre Mía (homicidio)

  3. Notas
    - El semáforo consolidado se calcula en frontend como MAX(candidato, partido)
*/

-- Agregar investigación para alianza Venceremos (incluye Voces del Pueblo)
DO $$
DECLARE
  v_venceremos_id uuid;
BEGIN
  SELECT id INTO v_venceremos_id 
  FROM partidos_politicos 
  WHERE nombre = 'Venceremos' AND es_alianza = true;

  IF v_venceremos_id IS NOT NULL THEN
    INSERT INTO partidos_politicos_investigaciones (
      partido_id, 
      tipo_investigacion, 
      descripcion_detallada, 
      organizacion_investigadora, 
      estado_actual, 
      nivel_severidad,
      fecha_inicio
    )
    VALUES (
      v_venceremos_id,
      'TERRORISMO',
      'Alianza incluye partido "Voces del Pueblo" cuyo líder Guillermo Bermejo fue CONDENADO a 15 años por terrorismo. Candidato Ronald Atencio fue abogado defensor de Bermejo. Vínculos documentados con organizaciones terroristas.',
      'Poder Judicial, DIRCOTE',
      'SENTENCIADO',
      5,
      '2020-05-15'::date
    );
  END IF;
END $$;

-- Agregar investigación para alianza Fuerza y Libertad (incluye Batalla Perú)
DO $$
DECLARE
  v_fyl_id uuid;
BEGIN
  SELECT id INTO v_fyl_id 
  FROM partidos_politicos 
  WHERE nombre = 'Fuerza y Libertad' AND es_alianza = true;

  IF v_fyl_id IS NOT NULL THEN
    INSERT INTO partidos_politicos_investigaciones (
      partido_id, 
      tipo_investigacion, 
      descripcion_detallada, 
      organizacion_investigadora, 
      estado_actual, 
      nivel_severidad
    )
    VALUES (
      v_fyl_id,
      'CRIMEN_ORGANIZADO',
      'Alianza incluye partido "Batalla Perú" con investigaciones críticas. Liderazgo bajo investigación por corrupción (Gonzalo Fernández). Presuntos vínculos con redes criminales. Fundadores con historial de corrupción regional.',
      'Fiscalía Anticorrupción',
      'EN_PROCESO',
      4
    );

    -- También agregar investigación por Fuerza Moderna (el otro partido de la alianza)
    INSERT INTO partidos_politicos_investigaciones (
      partido_id, 
      tipo_investigacion, 
      descripcion_detallada, 
      organizacion_investigadora, 
      estado_actual, 
      nivel_severidad
    )
    VALUES (
      v_fyl_id,
      'FINANCIAMIENTO',
      'Partido "Fuerza Moderna" (parte de la alianza) con irregularidades en financiamiento de campañas. Varios dirigentes bajo investigación por lavado de activos.',
      'ONPE, Fiscalía Anticorrupción',
      'EN_INVESTIGACION',
      3
    );
  END IF;
END $$;

-- Agregar investigación para Daniel Urresti
DO $$
DECLARE
  v_urresti_id uuid;
BEGIN
  SELECT id INTO v_urresti_id 
  FROM candidatos 
  WHERE nombre_completo = 'Daniel Urresti';

  IF v_urresti_id IS NOT NULL THEN
    INSERT INTO investigaciones_judiciales (
      candidato_id,
      tipo,
      descripcion,
      organismo_investigador,
      estado,
      severidad,
      alcance,
      fecha_inicio
    )
    VALUES (
      v_urresti_id,
      'PENAL',
      'Caso Madre Mía: Investigado por homicidio del periodista Hugo Bustíos. Proceso judicial de larga data. Absuelto en primera instancia pero con apelaciones pendientes.',
      'Poder Judicial',
      'EN_PROCESO',
      4,
      'INDIVIDUAL',
      '2008-03-20'::date
    );
  END IF;
END $$;

-- Actualizar investigaciones de candidatos críticos para incluir partido_id donde corresponda
UPDATE investigaciones_judiciales ij
SET partido_id = c.partido_id
FROM candidatos c
WHERE ij.candidato_id = c.id 
  AND ij.partido_id IS NULL
  AND c.partido_id IS NOT NULL
  AND ij.alcance IN ('MIXTO', 'COLECTIVO');
