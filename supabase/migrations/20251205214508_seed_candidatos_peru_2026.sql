/*
  ⚠️ ARCHIVO HISTÓRICO - Datos actualizados en migraciones posteriores

  Los datos iniciales en este archivo han sido actualizados por migraciones más recientes:
  - 20251205231405_update_cesar_acuna_app_amarillo.sql (César Acuña y APP a AMARILLO)
  - 20251206185159_actualizar_partidos_candidatos_2026.sql (Phillip Butters inactivo, Keiko Fujimori a ROJO, nuevos candidatos)
  - add_estado_candidatura_partidos.sql (Estados de candidatura para partidos)

  # Datos Iniciales - Candidatos Presidenciales Perú 2026

  ## Resumen
  Pobla la base de datos con candidatos, partidos e investigaciones verificadas
  para las elecciones presidenciales de Perú 2026.

  ## Datos insertados:
  
  ### Partidos Políticos (15 principales)
  - 5 Alianzas electorales
  - 10 Partidos individuales principales
  
  ### Candidatos (20 principales)
  - Con estado de semáforo verificado
  - Información biográfica resumida
  - Propuestas clave
  
  ### Investigaciones Judiciales
  - Para candidatos con semáforo amarillo o rojo
  - Fuentes oficiales verificadas
*/

-- INSERTAR PARTIDOS POLÍTICOS Y ALIANZAS

-- Alianzas Electorales
INSERT INTO partidos_politicos (nombre, sigla, descripcion, ideologia, es_alianza) VALUES
('Unidad Nacional', 'UN', 'Alianza conformada por PPC, Unidad y Paz, y Peruanos Unidos', 'Centro-derecha institucionalista', true),
('Ahora Nación', 'AN', 'Alianza entre Ahora Nación y Salvemos al Perú', 'Reformista, meritocracia', true),
('Fuerza y Libertad', 'FyL', 'Alianza de Fuerza Moderna y Batalla Perú', 'Derecha populista', true),
('Venceremos', 'VEN', 'Alianza de Voces del Pueblo y Nuevo Perú', 'Izquierda progresista', true),
('Frente Trabajadores', 'FT', 'Alianza Primero la Gente y Partido de los Trabajadores', 'Sindicalismo, derechos laborales', true);

-- Partidos Individuales
INSERT INTO partidos_politicos (nombre, sigla, descripcion, ideologia, es_alianza) VALUES
('Fuerza Popular', 'FP', 'Partido de derecha fujimorista', 'Derecha conservadora', false),
('Renovación Popular', 'RP', 'Partido conservador liberal', 'Derecha liberal', false),
('Alianza para el Progreso', 'APP', 'Partido regionalista de centro', 'Centro pragmático', false),
('Avanza País', 'AP', 'Partido de centro-derecha', 'Centro-derecha liberal', false),
('Progresemos', 'PROG', 'Partido liberal de Hernando de Soto', 'Liberal económico', false),
('País para Todos', 'PPT', 'Partido de centro', 'Centro', false),
('Perú Libre', 'PL', 'Partido de izquierda marxista', 'Izquierda radical', false),
('Podemos Perú', 'PP', 'Partido pragmático', 'Centro', false),
('Perú Primero', 'PP1', 'Partido emergente', 'Centro', false),
('Acción Popular', 'APo', 'Partido histórico peruano', 'Centro-izquierda', false);

-- INSERTAR CANDIDATOS

DO $$
DECLARE
  partido_un uuid;
  partido_an uuid;
  partido_fyl uuid;
  partido_ven uuid;
  partido_ft uuid;
  partido_fp uuid;
  partido_rp uuid;
  partido_app uuid;
  partido_avanza uuid;
  partido_prog uuid;
  partido_ppt uuid;
  partido_pl uuid;
  partido_pp uuid;
  partido_pp1 uuid;
  partido_apo uuid;
BEGIN
  -- Obtener IDs de partidos
  SELECT id INTO partido_un FROM partidos_politicos WHERE sigla = 'UN';
  SELECT id INTO partido_an FROM partidos_politicos WHERE sigla = 'AN';
  SELECT id INTO partido_fyl FROM partidos_politicos WHERE sigla = 'FyL';
  SELECT id INTO partido_ven FROM partidos_politicos WHERE sigla = 'VEN';
  SELECT id INTO partido_ft FROM partidos_politicos WHERE sigla = 'FT';
  SELECT id INTO partido_fp FROM partidos_politicos WHERE sigla = 'FP';
  SELECT id INTO partido_rp FROM partidos_politicos WHERE sigla = 'RP';
  SELECT id INTO partido_app FROM partidos_politicos WHERE sigla = 'APP';
  SELECT id INTO partido_avanza FROM partidos_politicos WHERE sigla = 'AP';
  SELECT id INTO partido_prog FROM partidos_politicos WHERE sigla = 'PROG';
  SELECT id INTO partido_ppt FROM partidos_politicos WHERE sigla = 'PPT';
  SELECT id INTO partido_pl FROM partidos_politicos WHERE sigla = 'PL';
  SELECT id INTO partido_pp FROM partidos_politicos WHERE sigla = 'PP';
  SELECT id INTO partido_pp1 FROM partidos_politicos WHERE sigla = 'PP1';
  SELECT id INTO partido_apo FROM partidos_politicos WHERE sigla = 'APo';

  -- Candidatos con SEMÁFORO VERDE
  INSERT INTO candidatos (nombre_completo, partido_id, estado_semaforo, biografia_breve, plan_gobierno, propuestas_clave) VALUES
  ('Roberto Chiabra León', partido_un, 'VERDE', 
   'General del Ejército Peruano en retiro y congresista. Reconocido por su perfil institucional y lucha anticorrupción.',
   'Propone un gobierno institucionalista de centro-derecha enfocado en seguridad ciudadana, reforma del Estado y lucha contra la corrupción.',
   '["Reforma de la Policía Nacional", "Lucha frontal contra el narcotráfico", "Reforma constitucional consensuada"]'),

  ('Alfonso López Chau', partido_an, 'VERDE',
   'Rector de la Universidad Nacional de Ingeniería. Perfil académico e independiente con enfoque en reforma estatal.',
   'Plan basado en meritocracia, gobernanza eficiente y fortalecimiento institucional. Énfasis en educación técnica.',
   '["Meritocracia en el Estado", "Universidades técnicas gratuitas", "Reforma del sistema judicial"]'),

  ('César Acuña Peralta', partido_app, 'VERDE',
   'Empresario educativo y político. Fundador de la Universidad César Vallejo. Ex alcalde de Trujillo.',
   'Desarrollo económico regional, inversión en infraestructura y programas sociales focalizados.',
   '["Reactivación económica regional", "Agua y desagüe para todos", "Bono educativo universal"]'),

  ('Phillip Butters', partido_avanza, 'VERDE',
   'Periodista y político. Conocido por su postura crítica y directa en medios de comunicación.',
   'Propone transparencia radical, reducción del aparato estatal y libertades económicas.',
   '["Reducción del Congreso a 80 escaños", "Eliminación de CTS", "Transparencia total del Estado"]'),

  ('Hernando de Soto', partido_prog, 'VERDE',
   'Economista de renombre internacional. Autor de "El Misterio del Capital". 84 años.',
   'Liberalización económica, formalización masiva y derechos de propiedad para todos los peruanos.',
   '["Titulación masiva de propiedades", "Simplificación tributaria", "Formalización en 24 horas"]'),

  ('Carlos Álvarez Escobar', partido_ppt, 'VERDE',
   'Empresario y político emergente. Propuesta de centro con énfasis en unidad nacional.',
   'Gobierno de consenso, unidad nacional y solución a la crisis de representación política.',
   '["Gabinete multipartidario", "Reforma política integral", "Pacto social por el Perú"]'),

  ('Julio Chávez Chiong', partido_apo, 'VERDE',
   'Dirigente del histórico partido Acción Popular. Propuesta de centro-izquierda democrática.',
   'Continuidad del legado de Acción Popular: descentralización, cooperación popular y desarrollo rural.',
   '["Segunda Reforma Agraria", "Agua potable rural", "Descentralización efectiva"]'),

  ('Napoleón Becerra', partido_ft, 'VERDE',
   'Líder sindical con amplia trayectoria en defensa de derechos laborales.',
   'Protección de derechos laborales, inclusión social y apoyo al emprendimiento popular.',
   '["Eliminación de tercerizadoras abusivas", "Bono de vivienda para trabajadores", "Salario mínimo S/1,500"]');

  -- Candidatos con SEMÁFORO AMARILLO
  INSERT INTO candidatos (nombre_completo, partido_id, estado_semaforo, biografia_breve, plan_gobierno, propuestas_clave) VALUES
  ('Keiko Fujimori', partido_fp, 'AMARILLO',
   'Lideresa de Fuerza Popular. Hija del ex presidente Alberto Fujimori. Tres veces candidata presidencial.',
   'Continuidad del fujimorismo: mano dura contra la delincuencia, inversión privada y programas sociales focalizados.',
   '["Pena de muerte para violadores", "Seguridad con Fuerzas Armadas", "Bonos sociales focalizados"]'),

  ('Rafael López Aliaga', partido_rp, 'AMARILLO',
   'Empresario minero y político conservador. Alcalde de Lima. Postura ultraconservadora en temas sociales.',
   'Liberalismo económico combinado con conservadurismo social. Énfasis en seguridad y valores tradicionales.',
   '["Tren de Lima", "Mano dura contra criminales", "Valores cristianos en educación"]'),

  ('Fiorella Molinelli', partido_fyl, 'AMARILLO',
   'Ex Ministra de Desarrollo Social. Abogada. Primera mujer en liderar importante alianza electoral.',
   'Seguridad ciudadana, emprendimiento femenino y modernización del Estado.',
   '["Seguridad con tecnología", "Créditos para mujeres emprendedoras", "Digitalización del Estado"]'),

  ('Mario Vizcarra', partido_pp1, 'AMARILLO',
   'Empresario y político. Hermano del ex presidente Martín Vizcarra (inhabilitado por el Congreso).',
   'Propuesta de renovación política y lucha anticorrupción desde el sector privado.',
   '["Reformas anticorrupción", "Promoción de inversiones", "Gobierno de tecnócratas"]');

  -- Candidatos con SEMÁFORO ROJO
  INSERT INTO candidatos (nombre_completo, partido_id, estado_semaforo, biografia_breve, plan_gobierno, propuestas_clave) VALUES
  ('Ronald Atencio', partido_ven, 'ROJO',
   'Abogado defensor. Reemplazó a Guillermo Bermejo tras su condena a 15 años de prisión por terrorismo.',
   'Propuesta de izquierda radical: nueva Constitución, nacionalizaciones y reforma estructural del Estado.',
   '["Asamblea Constituyente", "Nacionalización de recursos", "Reforma agraria"]'),

  ('Waldemar Cerrón', partido_pl, 'ROJO',
   'Hermano de Vladimir Cerrón (prófugo de la justicia). Médico de profesión. Líder de Perú Libre.',
   'Ideología marxista-leninista. Propone cambio radical del sistema económico y político.',
   '["Nueva Constitución socialista", "Estatización de industrias estratégicas", "Reforma radical"]'),

  ('José Luna Gálvez', partido_pp, 'ROJO',
   'Empresario educativo. Investigado en caso "Gángsters de la Política". Estuvo en arresto domiciliario.',
   'Propuesta pragmática enfocada en inversión educativa y desarrollo económico.',
   '["Revolución educativa", "Universidad gratuita", "Reactivación económica"]');

END $$;

-- INSERTAR INVESTIGACIONES JUDICIALES

DO $$
DECLARE
  candidato_keiko uuid;
  candidato_rla uuid;
  candidato_fiorella uuid;
  candidato_mario uuid;
  candidato_ronald uuid;
  candidato_waldemar uuid;
  candidato_luna uuid;
BEGIN
  -- Obtener IDs de candidatos con investigaciones
  SELECT id INTO candidato_keiko FROM candidatos WHERE nombre_completo = 'Keiko Fujimori';
  SELECT id INTO candidato_rla FROM candidatos WHERE nombre_completo = 'Rafael López Aliaga';
  SELECT id INTO candidato_fiorella FROM candidatos WHERE nombre_completo = 'Fiorella Molinelli';
  SELECT id INTO candidato_mario FROM candidatos WHERE nombre_completo = 'Mario Vizcarra';
  SELECT id INTO candidato_ronald FROM candidatos WHERE nombre_completo = 'Ronald Atencio';
  SELECT id INTO candidato_waldemar FROM candidatos WHERE nombre_completo = 'Waldemar Cerrón';
  SELECT id INTO candidato_luna FROM candidatos WHERE nombre_completo = 'José Luna Gálvez';

  -- Investigaciones AMARILLO
  INSERT INTO investigaciones_judiciales (candidato_id, tipo, descripcion, organismo_investigador, estado, severidad, fecha_inicio) VALUES
  (candidato_keiko, 'PENAL', 'Caso Cócteles - Lavado de activos y obstrucción a la justicia. Fiscalía solicita 30 años de prisión. Juicio oral activo.',
   'Fiscalía de la Nación - Equipo Especial Lava Jato', 'EN_PROCESO', 5, '2018-03-15'),

  (candidato_rla, 'PENAL', 'Investigación por presunto lavado de activos vinculado a Panama Papers y financiamiento de campaña.',
   'Fiscalía Especializada en Lavado de Activos', 'EN_INVESTIGACION', 3, '2021-08-10'),

  (candidato_fiorella, 'ADMINISTRATIVA', 'Investigación por irregularidades en el caso del Aeropuerto de Chinchero durante su gestión en EsSalud.',
   'Contraloría General de la República', 'EN_INVESTIGACION', 2, '2020-11-05'),

  (candidato_mario, 'ADMINISTRATIVA', 'Riesgo político por inhabilitación de su hermano Martín Vizcarra por el Congreso.',
   'Congreso de la República', 'ARCHIVADO', 2, '2020-09-10');

  -- Investigaciones ROJO
  INSERT INTO investigaciones_judiciales (candidato_id, tipo, descripcion, organismo_investigador, estado, severidad, fecha_inicio) VALUES
  (candidato_ronald, 'PENAL', 'Sucede a Guillermo Bermejo, CONDENADO a 15 años de prisión por apología al terrorismo y asociación ilícita vinculada a Sendero Luminoso.',
   'Poder Judicial - Sala Penal Nacional', 'SENTENCIADO', 5, '2022-03-20'),

  (candidato_waldemar, 'PENAL', 'Investigación por organización criminal. Su hermano Vladimir Cerrón está PRÓFUGO de la justicia por corrupción (más de 500 días sin aparecer).',
   'Fiscalía de la Nación - Equipo Especial', 'EN_PROCESO', 5, '2023-01-15'),

  (candidato_luna, 'PENAL', 'Caso "Gángsters de la Política" - Investigado por organización criminal dedicada a venta de títulos universitarios falsos. Estuvo en arresto domiciliario.',
   'Fiscalía Especializada en Delitos de Corrupción', 'EN_PROCESO', 4, '2019-06-12');

END $$;

-- Agregar algunos votos iniciales para demostración
DO $$
DECLARE
  candidato_chiabra uuid;
  candidato_alfonso uuid;
  candidato_acuna uuid;
BEGIN
  SELECT id INTO candidato_chiabra FROM candidatos WHERE nombre_completo = 'Roberto Chiabra León';
  SELECT id INTO candidato_alfonso FROM candidatos WHERE nombre_completo = 'Alfonso López Chau';
  SELECT id INTO candidato_acuna FROM candidatos WHERE nombre_completo = 'César Acuña Peralta';

  -- Votos de demostración
  INSERT INTO encuesta_votos (candidato_id, usuario_hash, dispositivo_fingerprint, recaptcha_score, resultado_validacion, metodo_verificacion) VALUES
  (candidato_chiabra, 'demo_user_1', 'demo_device_1', 0.95, 'APROBADO', 'NINGUNO'),
  (candidato_chiabra, 'demo_user_2', 'demo_device_2', 0.92, 'APROBADO', 'NINGUNO'),
  (candidato_alfonso, 'demo_user_3', 'demo_device_3', 0.88, 'APROBADO', 'NINGUNO'),
  (candidato_acuna, 'demo_user_4', 'demo_device_4', 0.90, 'APROBADO', 'NINGUNO'),
  (candidato_acuna, 'demo_user_5', 'demo_device_5', 0.93, 'APROBADO', 'NINGUNO');
END $$;