/*
  # Actualizar César Acuña y APP a AMARILLO

  1. Actualizar Candidato César Acuña
    - Cambiar semáforo de VERDE a AMARILLO
    - Agregar flag de investigaciones familiares
    - Agregar descripción de riesgo reputacional

  2. Actualizar Partido APP
    - Cambiar semáforo partidario de VERDE a AMARILLO
    - Agregar investigación colectiva
    - Agregar tipo de investigación partidaria

  3. Agregar Investigaciones
    - Investigaciones preliminares de César Acuña
    - Investigación familiar de Óscar Acuña (hermano)
    - Investigación partidaria de APP

  4. Contexto Crítico
    - Óscar Acuña: Fiscalía solicita 18 meses prisión preventiva
    - Caso Frigoinca/Qali Warma - presunta organización criminal
    - César Acuña: 72 carpetas fiscales históricas (mayoría archivadas)
*/

-- 1. Actualizar candidato César Acuña
UPDATE candidatos 
SET 
  estado_semaforo = 'AMARILLO',
  tiene_investigaciones_familiares = true,
  riesgo_reputacional_descripcion = 'Investigaciones preliminares activas sobre publicidad electoral (S/2M aprox.). Histórico de 72 carpetas fiscales, aunque mayoría archivadas. CRÍTICO: Hermano Óscar Acuña investigado por presunta organización criminal (Caso Frigoinca/Qali Warma), Fiscalía solicita 18 meses prisión preventiva.',
  fecha_actualizacion_estado_legal = now()
WHERE nombre_completo = 'César Acuña Peralta';

-- 2. Actualizar partido APP
UPDATE partidos_politicos 
SET 
  estado_semaforo_partidario = 'AMARILLO',
  tiene_investigacion_colectiva = true,
  tipo_investigacion_partidaria = 'CORRUPCION_REGIONAL, CRIMEN_ORGANIZADO',
  riesgo_reputacional_historico = 'Caso Óscar Acuña (hermano del líder y candidato César Acuña) bajo investigación por presunta organización criminal. Presuntos vínculos con contrataciones públicas irregulares en programa Qali Warma.'
WHERE nombre = 'Alianza para el Progreso';

-- 3. Agregar investigaciones de César Acuña
DO $$
DECLARE
  v_cesar_id uuid;
  v_app_id uuid;
BEGIN
  -- Obtener IDs
  SELECT id INTO v_cesar_id FROM candidatos WHERE nombre_completo = 'César Acuña Peralta';
  SELECT id INTO v_app_id FROM partidos_politicos WHERE nombre = 'Alianza para el Progreso';

  -- Investigación preliminar de César Acuña
  IF v_cesar_id IS NOT NULL THEN
    INSERT INTO investigaciones_judiciales (
      candidato_id,
      tipo,
      descripcion,
      organismo_investigador,
      estado,
      severidad,
      alcance,
      afecta_candidatura,
      fecha_inicio
    )
    VALUES (
      v_cesar_id,
      'PRELIMINAR',
      'Investigaciones preliminares activas por presunta publicidad electoral irregular (aproximadamente S/2 millones). Histórico: Acumulación de 72 carpetas fiscales a lo largo de su carrera política, aunque la mayoría han sido archivadas sin condenas.',
      'Fiscalía Provincial',
      'EN_INVESTIGACION',
      2,
      'INDIVIDUAL',
      false,
      '2024-01-15'::date
    );

    -- Investigación familiar: Óscar Acuña (hermano)
    INSERT INTO investigaciones_judiciales (
      candidato_id,
      partido_id,
      tipo,
      descripcion,
      organismo_investigador,
      numero_expediente,
      estado,
      severidad,
      alcance,
      liderazgo_afectado,
      afecta_candidatura,
      fecha_inicio
    )
    VALUES (
      v_cesar_id,
      v_app_id,
      'PENAL',
      'CASO ÓSCAR ACUÑA (Hermano de César Acuña): Fiscalía solicita 18 meses de prisión preventiva por presunta organización criminal. Investigación relacionada con Caso Frigoinca/Qali Warma. Presuntos vínculos con contrataciones públicas irregulares en programa de alimentación escolar. Alto impacto reputacional para candidatura.',
      'Fiscalía Especializada en Delitos de Corrupción',
      'EXP-2024-FRIGOINCA-001',
      'EN_PROCESO',
      4,
      'FAMILIAR',
      'Óscar Acuña (Hermano)',
      true,
      '2024-03-20'::date
    );
  END IF;

  -- Agregar investigación partidaria a APP
  IF v_app_id IS NOT NULL THEN
    INSERT INTO partidos_politicos_investigaciones (
      partido_id,
      tipo_investigacion,
      descripcion_detallada,
      organizacion_investigadora,
      fecha_inicio,
      estado_actual,
      nivel_severidad,
      candidatos_historicos_investigados
    )
    VALUES (
      v_app_id,
      'CORRUPCION_REGIONAL',
      'Caso Óscar Acuña - Frigoinca/Qali Warma: Hermano del líder partidario y candidato presidencial César Acuña investigado por presunta organización criminal vinculada a contrataciones públicas irregulares en el programa de alimentación escolar Qali Warma. Fiscalía solicita 18 meses de prisión preventiva. Riesgo reputacional ALTO para el partido debido al vínculo familiar directo con el liderazgo.',
      'Fiscalía Especializada en Delitos de Corrupción, ONPE',
      '2024-03-20'::date,
      'EN_PROCESO',
      4,
      '[
        {
          "nombre": "Óscar Acuña",
          "relacion": "Hermano del candidato",
          "cargo": "Vinculado a contrataciones Qali Warma",
          "investigacion": "Organización criminal - Caso Frigoinca",
          "estado": "Fiscalía solicita prisión preventiva",
          "impacto": "ALTO - Vínculo familiar directo"
        }
      ]'::jsonb
    );
  END IF;
END $$;
