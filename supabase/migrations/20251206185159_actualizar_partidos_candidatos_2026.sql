/*
  # Actualización de Partidos y Candidatos 2026
  
  ## Descripción General
  Esta migración actualiza la información de partidos políticos y candidatos para las elecciones 
  presidenciales de Perú 2026, incorporando los últimos cambios políticos y judiciales.

  ## 1. Cambios Políticos Importantes
    - **Avanza País**: Phillip Butters renunció irrevocablemente el 5/12/2025
    - **Acción Popular**: Múltiples precandidatos en proceso de primarias internas
    - **Keiko Fujimori**: Actualización de estado del semáforo debido a procesos judiciales en curso

  ## 2. Nuevos Partidos Agregados
    - **Ciudadanos por el Perú** (centroderecha, tecnocrático)
    - **Demócrata Verde** (enfoque ambientalista)
    - **Integridad Democrática** (partido pequeño)

  ## 3. Nuevos Candidatos
    - Roberto Sánchez (Juntos por el Perú) - exministro, izquierda moderada
    - Morgan Quero (Ciudadanos por el Perú) - perfil tecnocrático
    - Alex González (Demócrata Verde) - agenda ambiental
    - Wolfgang Grozo (Integridad Democrática) - presencia limitada
    - Alfredo Barnechea (Acción Popular) - precandidato en primarias
    - Víctor Andrés García Belaúnde (Acción Popular) - precandidato en primarias

  ## 4. Actualizaciones de Investigaciones
    - Fiorella Molinelli: Vinculada a casos Chinchero y EsSalud
    - César Acuña: Investigaciones preliminares actualizadas
    - José Luna Gálvez: Investigación por presunta organización criminal
    - Waldemar Cerrón: Influencia de Vladimir Cerrón (prófugo)
    - Keiko Fujimori: Procesos judiciales en curso

  ## 5. Seguridad (RLS)
    - Todas las tablas mantienen RLS habilitado
    - Las políticas existentes se mantienen sin cambios
*/

-- ============================================================================
-- PASO 1: ACTUALIZAR PARTIDOS EXISTENTES
-- ============================================================================

-- Actualizar Keiko Fujimori: cambiar semáforo de AMARILLO a ROJO
UPDATE candidatos 
SET estado_semaforo = 'ROJO',
    fecha_actualizacion_estado_legal = now()
WHERE nombre_completo = 'Keiko Fujimori'
  AND estado_semaforo != 'ROJO';

-- Desactivar Phillip Butters (renunció el 5/12/2025)
UPDATE candidatos 
SET activo = false,
    biografia_breve = 'Precandidato que renunció irrevocablemente el 5 de diciembre de 2025.'
WHERE nombre_completo = 'Phillip Butters';

-- Actualizar estado de Avanza País (en transición de liderazgo)
UPDATE partidos_politicos 
SET descripcion = 'Partido de centro-derecha en proceso de definición de candidatura tras la renuncia de Phillip Butters. Se baraja a José Williams como posible reemplazo.',
    estado_semaforo_partidario = 'AMARILLO'
WHERE nombre = 'Avanza País';

-- Actualizar Acción Popular (múltiples precandidatos)
UPDATE partidos_politicos 
SET descripcion = 'Partido político histórico con múltiples precandidatos en proceso de primarias internas (6 listas). Candidatos principales: Julio Chávez, Alfredo Barnechea, Víctor Andrés García Belaúnde.',
    estado_semaforo_partidario = 'AMARILLO'
WHERE nombre = 'Acción Popular';

-- ============================================================================
-- PASO 2: AGREGAR NUEVOS PARTIDOS
-- ============================================================================

-- Ciudadanos por el Perú (centroderecha)
INSERT INTO partidos_politicos (nombre, sigla, descripcion, ideologia, es_alianza, estado_semaforo_partidario)
VALUES (
  'Ciudadanos por el Perú',
  'CPP',
  'Partido de centro-derecha con perfil tecnocrático, enfocado en la gestión eficiente del Estado.',
  'Centro-derecha',
  false,
  'VERDE'
) ON CONFLICT DO NOTHING;

-- Demócrata Verde
INSERT INTO partidos_politicos (nombre, sigla, descripcion, ideologia, es_alianza, estado_semaforo_partidario)
VALUES (
  'Demócrata Verde',
  'DV',
  'Partido con enfoque ambientalista y agenda de descentralización.',
  'Ambientalista',
  false,
  'VERDE'
) ON CONFLICT DO NOTHING;

-- Integridad Democrática
INSERT INTO partidos_politicos (nombre, sigla, descripcion, ideologia, es_alianza, estado_semaforo_partidario)
VALUES (
  'Integridad Democrática',
  'ID',
  'Partido pequeño con presencia mediática limitada.',
  'Centro',
  false,
  'VERDE'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- PASO 3: AGREGAR NUEVOS CANDIDATOS
-- ============================================================================

-- Roberto Sánchez (Juntos por el Perú)
DO $$
DECLARE
  v_partido_id uuid;
BEGIN
  SELECT id INTO v_partido_id FROM partidos_politicos WHERE nombre = 'Juntos por el Perú';
  
  IF v_partido_id IS NOT NULL THEN
    INSERT INTO candidatos (nombre_completo, partido_id, estado_semaforo, biografia_breve, activo)
    VALUES (
      'Roberto Sánchez',
      v_partido_id,
      'VERDE',
      'Exministro y figura de la izquierda moderada peruana.',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Morgan Quero (Ciudadanos por el Perú)
DO $$
DECLARE
  v_partido_id uuid;
BEGIN
  SELECT id INTO v_partido_id FROM partidos_politicos WHERE nombre = 'Ciudadanos por el Perú';
  
  IF v_partido_id IS NOT NULL THEN
    INSERT INTO candidatos (nombre_completo, partido_id, estado_semaforo, biografia_breve, activo)
    VALUES (
      'Morgan Quero',
      v_partido_id,
      'VERDE',
      'Perfil tecnocrático que compite en el segmento de centro-derecha.',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Alex González (Demócrata Verde)
DO $$
DECLARE
  v_partido_id uuid;
BEGIN
  SELECT id INTO v_partido_id FROM partidos_politicos WHERE nombre = 'Demócrata Verde';
  
  IF v_partido_id IS NOT NULL THEN
    INSERT INTO candidatos (nombre_completo, partido_id, estado_semaforo, biografia_breve, activo)
    VALUES (
      'Alex González',
      v_partido_id,
      'VERDE',
      'Candidato con enfoque en agenda ambiental y descentralización.',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Wolfgang Grozo (Integridad Democrática)
DO $$
DECLARE
  v_partido_id uuid;
BEGIN
  SELECT id INTO v_partido_id FROM partidos_politicos WHERE nombre = 'Integridad Democrática';
  
  IF v_partido_id IS NOT NULL THEN
    INSERT INTO candidatos (nombre_completo, partido_id, estado_semaforo, biografia_breve, activo)
    VALUES (
      'Wolfgang Grozo',
      v_partido_id,
      'VERDE',
      'Candidato de partido pequeño con presencia mediática limitada.',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Alfredo Barnechea (Acción Popular)
DO $$
DECLARE
  v_partido_id uuid;
BEGIN
  SELECT id INTO v_partido_id FROM partidos_politicos WHERE nombre = 'Acción Popular' LIMIT 1;
  
  IF v_partido_id IS NOT NULL THEN
    INSERT INTO candidatos (nombre_completo, partido_id, estado_semaforo, biografia_breve, activo)
    VALUES (
      'Alfredo Barnechea',
      v_partido_id,
      'VERDE',
      'Precandidato en primarias internas de Acción Popular.',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Víctor Andrés García Belaúnde (Acción Popular)
DO $$
DECLARE
  v_partido_id uuid;
BEGIN
  SELECT id INTO v_partido_id FROM partidos_politicos WHERE nombre = 'Acción Popular' LIMIT 1;
  
  IF v_partido_id IS NOT NULL THEN
    INSERT INTO candidatos (nombre_completo, partido_id, estado_semaforo, biografia_breve, activo)
    VALUES (
      'Víctor Andrés García Belaúnde',
      v_partido_id,
      'VERDE',
      'Precandidato en primarias internas de Acción Popular.',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- PASO 4: ACTUALIZAR/AGREGAR INVESTIGACIONES JUDICIALES
-- ============================================================================

-- Fiorella Molinelli: Casos Chinchero y EsSalud
DO $$
DECLARE
  v_candidato_id uuid;
BEGIN
  SELECT id INTO v_candidato_id FROM candidatos WHERE nombre_completo = 'Fiorella Molinelli';
  
  IF v_candidato_id IS NOT NULL THEN
    -- Actualizar estado del semáforo
    UPDATE candidatos 
    SET estado_semaforo = 'AMARILLO',
        fecha_actualizacion_estado_legal = now()
    WHERE id = v_candidato_id;
    
    -- Agregar investigación Chinchero
    INSERT INTO investigaciones_judiciales (
      candidato_id, tipo, descripcion, organismo_investigador, 
      estado, severidad, alcance, afecta_candidatura
    )
    VALUES (
      v_candidato_id,
      'PENAL',
      'Vinculada al caso del proyecto del Aeropuerto de Chinchero',
      'Poder Judicial',
      'EN_PROCESO',
      3,
      'INDIVIDUAL',
      true
    ) ON CONFLICT DO NOTHING;
    
    -- Agregar investigación EsSalud
    INSERT INTO investigaciones_judiciales (
      candidato_id, tipo, descripcion, organismo_investigador, 
      estado, severidad, alcance, afecta_candidatura
    )
    VALUES (
      v_candidato_id,
      'PENAL',
      'Investigación relacionada con el caso EsSalud',
      'Poder Judicial',
      'EN_PROCESO',
      3,
      'INDIVIDUAL',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Keiko Fujimori: Actualizar investigaciones
DO $$
DECLARE
  v_candidato_id uuid;
BEGIN
  SELECT id INTO v_candidato_id FROM candidatos WHERE nombre_completo = 'Keiko Fujimori';
  
  IF v_candidato_id IS NOT NULL THEN
    -- Actualizar todas las investigaciones existentes a estado más grave
    UPDATE investigaciones_judiciales 
    SET estado = 'EN_PROCESO',
        severidad = GREATEST(severidad, 4),
        fecha_inicio = COALESCE(fecha_inicio, '2023-01-01'::date)
    WHERE candidato_id = v_candidato_id;
  END IF;
END $$;

-- César Acuña: Investigaciones preliminares
DO $$
DECLARE
  v_candidato_id uuid;
BEGIN
  SELECT id INTO v_candidato_id FROM candidatos WHERE nombre_completo = 'César Acuña Peralta';
  
  IF v_candidato_id IS NOT NULL THEN
    -- Agregar investigaciones preliminares si no existen
    INSERT INTO investigaciones_judiciales (
      candidato_id, tipo, descripcion, organismo_investigador, 
      estado, severidad, alcance, afecta_candidatura
    )
    VALUES (
      v_candidato_id,
      'PRELIMINAR',
      'Bajo investigaciones preliminares por diversos casos',
      'Ministerio Público',
      'EN_INVESTIGACION',
      2,
      'INDIVIDUAL',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- José Luna Gálvez: Organización criminal
DO $$
DECLARE
  v_candidato_id uuid;
BEGIN
  SELECT id INTO v_candidato_id FROM candidatos WHERE nombre_completo = 'José Luna Gálvez';
  
  IF v_candidato_id IS NOT NULL THEN
    -- Actualizar estado del semáforo a ROJO
    UPDATE candidatos 
    SET estado_semaforo = 'ROJO',
        fecha_actualizacion_estado_legal = now()
    WHERE id = v_candidato_id;
    
    -- Actualizar o agregar investigación por organización criminal
    INSERT INTO investigaciones_judiciales (
      candidato_id, tipo, descripcion, organismo_investigador, 
      estado, severidad, alcance, afecta_candidatura
    )
    VALUES (
      v_candidato_id,
      'PENAL',
      'Investigado por presunta organización criminal',
      'Poder Judicial',
      'EN_PROCESO',
      5,
      'INDIVIDUAL',
      true
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Waldemar Cerrón: Influencia de Vladimir Cerrón (prófugo)
DO $$
DECLARE
  v_candidato_id uuid;
  v_partido_id uuid;
BEGIN
  SELECT id INTO v_candidato_id FROM candidatos WHERE nombre_completo = 'Waldemar Cerrón';
  SELECT partido_id INTO v_partido_id FROM candidatos WHERE id = v_candidato_id;
  
  IF v_candidato_id IS NOT NULL THEN
    -- Actualizar biografía
    UPDATE candidatos 
    SET biografia_breve = 'Precandidato de Perú Libre. Bajo la influencia del liderazgo de Vladimir Cerrón, quien está investigado y se encuentra prófugo.',
        tiene_investigaciones_familiares = true,
        riesgo_reputacional_descripcion = 'Vinculación directa con Vladimir Cerrón (hermano), líder del partido que se encuentra prófugo de la justicia.'
    WHERE id = v_candidato_id;
    
    -- Agregar investigación de riesgo familiar
    INSERT INTO investigaciones_judiciales (
      candidato_id, tipo, descripcion, organismo_investigador, 
      estado, severidad, alcance, afecta_candidatura, liderazgo_afectado
    )
    VALUES (
      v_candidato_id,
      'PENAL',
      'Vinculación con Vladimir Cerrón, líder del partido investigado y en condición de prófugo',
      'Poder Judicial',
      'EN_PROCESO',
      4,
      'FAMILIAR',
      true,
      'Vladimir Cerrón (líder de Perú Libre, hermano del candidato)'
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Ronald Atencio (Venceremos): Vinculación con Guillermo Bermejo
DO $$
DECLARE
  v_candidato_id uuid;
BEGIN
  SELECT id INTO v_candidato_id FROM candidatos WHERE nombre_completo = 'Ronald Atencio';
  
  IF v_candidato_id IS NOT NULL THEN
    UPDATE candidatos 
    SET riesgo_reputacional_descripcion = 'Asociado políticamente al entorno de Guillermo Bermejo.'
    WHERE id = v_candidato_id;
  END IF;
END $$;

-- Mario Vizcarra (Perú Primero): Vinculación con Martín Vizcarra
DO $$
DECLARE
  v_candidato_id uuid;
BEGIN
  SELECT id INTO v_candidato_id FROM candidatos WHERE nombre_completo = 'Mario Vizcarra';
  
  IF v_candidato_id IS NOT NULL THEN
    UPDATE candidatos 
    SET riesgo_reputacional_descripcion = 'Vinculado políticamente a Martín Vizcarra, expresidente con investigaciones judiciales.',
        tiene_investigaciones_familiares = true
    WHERE id = v_candidato_id;
  END IF;
END $$;

-- ============================================================================
-- PASO 5: ACTUALIZAR PARTIDOS CON RIESGO REPUTACIONAL
-- ============================================================================

-- Actualizar partidos con investigaciones colectivas o riesgo histórico
UPDATE partidos_politicos 
SET tiene_investigacion_colectiva = true,
    tipo_investigacion_partidaria = 'Investigaciones múltiples a miembros históricos y actuales del partido',
    riesgo_reputacional_historico = 'Partido con múltiples investigaciones judiciales a su liderazgo histórico y actual'
WHERE nombre = 'Fuerza Popular';

UPDATE partidos_politicos 
SET tiene_investigacion_colectiva = true,
    tipo_investigacion_partidaria = 'Líder del partido prófugo de la justicia',
    riesgo_reputacional_historico = 'Vladimir Cerrón, líder ideológico del partido, se encuentra prófugo con orden de captura'
WHERE nombre = 'Perú Libre';

UPDATE partidos_politicos 
SET tiene_investigacion_colectiva = true,
    tipo_investigacion_partidaria = 'Candidato principal investigado por organización criminal',
    riesgo_reputacional_historico = 'José Luna Gálvez, líder y fundador del partido, bajo investigación por presunta organización criminal'
WHERE nombre = 'Podemos Perú';

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Contar partidos activos
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count FROM partidos_politicos;
  RAISE NOTICE 'Total de partidos políticos registrados: %', v_count;
END $$;

-- Contar candidatos activos
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count FROM candidatos WHERE activo = true;
  RAISE NOTICE 'Total de candidatos activos: %', v_count;
END $$;
