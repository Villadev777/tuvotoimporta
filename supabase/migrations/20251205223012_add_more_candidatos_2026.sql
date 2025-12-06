/*
  # Agregar más candidatos para Elecciones 2026

  1. Nuevos Partidos Políticos
    - Se agregan partidos adicionales que faltan en el sistema
    
  2. Nuevos Candidatos
    - George Forsyth (Somos Perú)
    - Verónika Mendoza (Nuevo Perú)
    - Daniel Urresti (Podemos Perú)
    - Yonhy Lescano (Acción Popular)
    - Alberto Beingolea (PPC)
    - Antauro Humala (A.N.T.A.U.R.O)
    - Marco Arana (Frente Amplio)
    - Daniel Salaverry (Perú Nación)
    - Nicanor Boluarte (Avanza País)
    - Carlos Neuhaus (independiente)

  3. Investigaciones Judiciales
    - Se agregan registros de investigaciones para candidatos con situación legal conocida
*/

-- Insertar partidos políticos adicionales
INSERT INTO partidos_politicos (nombre, sigla, descripcion, ideologia, es_alianza) VALUES
  ('Somos Perú', 'SP', 'Partido político fundado por Alberto Andrade', 'Centro', false),
  ('Nuevo Perú', 'NP', 'Movimiento político de izquierda', 'Izquierda', false),
  ('Partido Popular Cristiano', 'PPC', 'Partido político de centro-derecha con tradición democristiana', 'Centro-derecha', false),
  ('A.N.T.A.U.R.O', 'ANT', 'Movimiento político nacionalista', 'Nacionalismo', false),
  ('Frente Amplio', 'FA', 'Coalición política de izquierda', 'Izquierda', true),
  ('Perú Nación', 'PN', 'Movimiento político nacionalista', 'Centro', false),
  ('Juntos por el Perú', 'JPP', 'Partido de izquierda democrática', 'Izquierda', false),
  ('Avanza País', 'AV', 'Partido político liberal', 'Liberal', false)
ON CONFLICT DO NOTHING;

-- Insertar candidatos adicionales
DO $$
DECLARE
  v_partido_sp_id uuid;
  v_partido_np_id uuid;
  v_partido_pp_id uuid;
  v_partido_ap_id uuid;
  v_partido_ppc_id uuid;
  v_partido_ant_id uuid;
  v_partido_fa_id uuid;
  v_partido_pn_id uuid;
  v_partido_av_id uuid;
  
  v_forsyth_id uuid;
  v_mendoza_id uuid;
  v_urresti_id uuid;
  v_lescano_id uuid;
  v_beingolea_id uuid;
  v_humala_id uuid;
  v_arana_id uuid;
  v_salaverry_id uuid;
  v_boluarte_id uuid;
  v_neuhaus_id uuid;
BEGIN
  -- Obtener IDs de partidos
  SELECT id INTO v_partido_sp_id FROM partidos_politicos WHERE sigla = 'SP';
  SELECT id INTO v_partido_np_id FROM partidos_politicos WHERE sigla = 'NP';
  SELECT id INTO v_partido_pp_id FROM partidos_politicos WHERE sigla = 'PP';
  SELECT id INTO v_partido_ap_id FROM partidos_politicos WHERE sigla = 'AP';
  SELECT id INTO v_partido_ppc_id FROM partidos_politicos WHERE sigla = 'PPC';
  SELECT id INTO v_partido_ant_id FROM partidos_politicos WHERE sigla = 'ANT';
  SELECT id INTO v_partido_fa_id FROM partidos_politicos WHERE sigla = 'FA';
  SELECT id INTO v_partido_pn_id FROM partidos_politicos WHERE sigla = 'PN';
  SELECT id INTO v_partido_av_id FROM partidos_politicos WHERE sigla = 'AV';

  -- George Forsyth
  IF NOT EXISTS (SELECT 1 FROM candidatos WHERE nombre_completo = 'George Forsyth') THEN
    INSERT INTO candidatos (
      nombre_completo, 
      partido_id, 
      estado_semaforo,
      biografia_breve,
      plan_gobierno,
      propuestas_clave,
      activo
    ) VALUES (
      'George Forsyth',
      v_partido_sp_id,
      'VERDE',
      'Ex alcalde de La Victoria, deportista profesional y figura política emergente.',
      'Propone modernización del Estado, seguridad ciudadana y combate a la corrupción.',
      '["Modernización del Estado", "Seguridad ciudadana efectiva", "Transparencia y anticorrupción", "Apoyo a emprendedores"]'::jsonb,
      true
    ) RETURNING id INTO v_forsyth_id;
  END IF;

  -- Verónika Mendoza
  IF NOT EXISTS (SELECT 1 FROM candidatos WHERE nombre_completo = 'Verónika Mendoza') THEN
    INSERT INTO candidatos (
      nombre_completo, 
      partido_id, 
      estado_semaforo,
      biografia_breve,
      plan_gobierno,
      propuestas_clave,
      activo
    ) VALUES (
      'Verónika Mendoza',
      v_partido_np_id,
      'VERDE',
      'Psicóloga y política de izquierda, candidata presidencial en 2016 y 2021.',
      'Enfoque en justicia social, derechos humanos y protección ambiental.',
      '["Reforma constitucional", "Justicia social", "Protección ambiental", "Derechos humanos"]'::jsonb,
      true
    ) RETURNING id INTO v_mendoza_id;
  END IF;

  -- Daniel Urresti
  IF NOT EXISTS (SELECT 1 FROM candidatos WHERE nombre_completo = 'Daniel Urresti') THEN
    INSERT INTO candidatos (
      nombre_completo, 
      partido_id, 
      estado_semaforo,
      biografia_breve,
      plan_gobierno,
      propuestas_clave,
      activo
    ) VALUES (
      'Daniel Urresti',
      v_partido_pp_id,
      'AMARILLO',
      'General retirado del Ejército, ex Ministro del Interior y congresista.',
      'Enfoque en seguridad nacional, orden público y lucha frontal contra la delincuencia.',
      '["Mano dura contra la delincuencia", "Fortalecimiento de FFAA", "Reforma policial", "Seguridad nacional"]'::jsonb,
      true
    ) RETURNING id INTO v_urresti_id;
  END IF;

  -- Yonhy Lescano
  IF NOT EXISTS (SELECT 1 FROM candidatos WHERE nombre_completo = 'Yonhy Lescano') THEN
    INSERT INTO candidatos (
      nombre_completo, 
      partido_id, 
      estado_semaforo,
      biografia_breve,
      plan_gobierno,
      propuestas_clave,
      activo
    ) VALUES (
      'Yonhy Lescano',
      v_partido_ap_id,
      'VERDE',
      'Abogado, periodista y político de Acción Popular. Candidato presidencial 2021.',
      'Propone descentralización efectiva, honestidad y transparencia en la gestión pública.',
      '["Descentralización real", "Transparencia gubernamental", "Respeto institucional", "Obras por impuestos"]'::jsonb,
      true
    ) RETURNING id INTO v_lescano_id;
  END IF;

  -- Alberto Beingolea
  IF NOT EXISTS (SELECT 1 FROM candidatos WHERE nombre_completo = 'Alberto Beingolea') THEN
    INSERT INTO candidatos (
      nombre_completo, 
      partido_id, 
      estado_semaforo,
      biografia_breve,
      plan_gobierno,
      propuestas_clave,
      activo
    ) VALUES (
      'Alberto Beingolea',
      v_partido_ppc_id,
      'VERDE',
      'Economista y político del PPC. Candidato presidencial en 2006.',
      'Economía de mercado social, valores democristianos y desarrollo sostenible.',
      '["Economía social de mercado", "Valores cristianos", "Educación de calidad", "Desarrollo sostenible"]'::jsonb,
      true
    ) RETURNING id INTO v_beingolea_id;
  END IF;

  -- Antauro Humala
  IF NOT EXISTS (SELECT 1 FROM candidatos WHERE nombre_completo = 'Antauro Humala') THEN
    INSERT INTO candidatos (
      nombre_completo, 
      partido_id, 
      estado_semaforo,
      biografia_breve,
      plan_gobierno,
      propuestas_clave,
      activo
    ) VALUES (
      'Antauro Humala',
      v_partido_ant_id,
      'ROJO',
      'Ex militar y líder del movimiento etnocacerista. Cumplió condena por el Andahuaylazo.',
      'Propone nacionalismo étnico y cambio radical del sistema político.',
      '["Nacionalismo étnico", "Segunda reforma agraria", "Salida al mar", "Cambio constitucional"]'::jsonb,
      true
    ) RETURNING id INTO v_humala_id;

    -- Agregar investigación para Antauro Humala
    INSERT INTO investigaciones_judiciales (
      candidato_id,
      tipo,
      descripcion,
      organismo_investigador,
      estado,
      severidad,
      fecha_inicio
    ) VALUES (
      v_humala_id,
      'PENAL',
      'Sentenciado por el levantamiento militar de Andahuaylas (Andahuaylazo) en 2005',
      'Poder Judicial',
      'SENTENCIADO',
      5,
      '2005-01-01'
    );
  END IF;

  -- Marco Arana
  IF NOT EXISTS (SELECT 1 FROM candidatos WHERE nombre_completo = 'Marco Arana') THEN
    INSERT INTO candidatos (
      nombre_completo, 
      partido_id, 
      estado_semaforo,
      biografia_breve,
      plan_gobierno,
      propuestas_clave,
      activo
    ) VALUES (
      'Marco Arana',
      v_partido_fa_id,
      'VERDE',
      'Ex sacerdote católico, ambientalista y defensor de derechos humanos.',
      'Justicia social, protección ambiental y reforma del Estado.',
      '["Justicia ambiental", "Derechos humanos", "Nuevo modelo económico", "Asamblea constituyente"]'::jsonb,
      true
    ) RETURNING id INTO v_arana_id;
  END IF;

  -- Daniel Salaverry
  IF NOT EXISTS (SELECT 1 FROM candidatos WHERE nombre_completo = 'Daniel Salaverry') THEN
    INSERT INTO candidatos (
      nombre_completo, 
      partido_id, 
      estado_semaforo,
      biografia_breve,
      plan_gobierno,
      propuestas_clave,
      activo
    ) VALUES (
      'Daniel Salaverry',
      v_partido_pn_id,
      'AMARILLO',
      'Ex presidente del Congreso, abogado y empresario.',
      'Modernización del Estado, desarrollo económico y reforma política.',
      '["Modernización estatal", "Desarrollo económico", "Reforma del Congreso", "Descentralización"]'::jsonb,
      true
    ) RETURNING id INTO v_salaverry_id;

    -- Agregar investigación para Daniel Salaverry
    INSERT INTO investigaciones_judiciales (
      candidato_id,
      tipo,
      descripcion,
      organismo_investigador,
      estado,
      severidad,
      fecha_inicio
    ) VALUES (
      v_salaverry_id,
      'PENAL',
      'Investigación fiscal por presuntos actos irregulares durante su gestión en el Congreso',
      'Ministerio Público',
      'EN_INVESTIGACION',
      3,
      '2019-06-01'
    );
  END IF;

  -- Nicanor Boluarte
  IF NOT EXISTS (SELECT 1 FROM candidatos WHERE nombre_completo = 'Nicanor Boluarte') THEN
    INSERT INTO candidatos (
      nombre_completo, 
      partido_id, 
      estado_semaforo,
      biografia_breve,
      plan_gobierno,
      propuestas_clave,
      activo
    ) VALUES (
      'Nicanor Boluarte',
      v_partido_av_id,
      'AMARILLO',
      'Hermano de Dina Boluarte, abogado y asesor político.',
      'Continuidad de políticas liberales y fortalecimiento institucional.',
      '["Estabilidad económica", "Reformas liberales", "Fortalecimiento institucional", "Inversión privada"]'::jsonb,
      true
    ) RETURNING id INTO v_boluarte_id;

    -- Agregar investigación para Nicanor Boluarte
    INSERT INTO investigaciones_judiciales (
      candidato_id,
      tipo,
      descripcion,
      organismo_investigador,
      estado,
      severidad,
      fecha_inicio
    ) VALUES (
      v_boluarte_id,
      'PENAL',
      'Investigación por presunto tráfico de influencias y organización criminal',
      'Ministerio Público',
      'EN_INVESTIGACION',
      4,
      '2023-05-01'
    );
  END IF;

  -- Carlos Neuhaus (independiente)
  IF NOT EXISTS (SELECT 1 FROM candidatos WHERE nombre_completo = 'Carlos Neuhaus') THEN
    INSERT INTO candidatos (
      nombre_completo, 
      partido_id, 
      estado_semaforo,
      biografia_breve,
      plan_gobierno,
      propuestas_clave,
      activo
    ) VALUES (
      'Carlos Neuhaus',
      NULL,
      'VERDE',
      'Empresario, ex presidente del IPD y organizador de eventos deportivos internacionales.',
      'Gestión empresarial aplicada al Estado, desarrollo deportivo y juventud.',
      '["Gestión eficiente", "Desarrollo deportivo", "Oportunidades para jóvenes", "Transparencia"]'::jsonb,
      true
    ) RETURNING id INTO v_neuhaus_id;
  END IF;

END $$;
