/*
  # Actualizar Semáforo de Partidos Políticos

  1. Actualizar Estado de Partidos
    - Clasificar partidos según investigaciones
    - ROJO: Fuerza Popular, Batalla Perú, Voces del Pueblo, Perú Libre, Podemos Perú
    - AMARILLO: Salvemos al Perú, Fuerza Moderna, Nuevo Perú, Renovación Popular, Acción Popular, Avanza País
    - VERDE: Resto de partidos

  2. Marcar Investigaciones Colectivas
    - Identificar partidos con investigaciones institucionales
*/

-- Actualizar partidos con semáforo ROJO (riesgo crítico)
UPDATE partidos_politicos 
SET 
  estado_semaforo_partidario = 'ROJO',
  tiene_investigacion_colectiva = true,
  tipo_investigacion_partidaria = 'CRIMEN_ORGANIZADO, CORRUPCION'
WHERE nombre IN ('Fuerza Popular', 'Podemos Perú', 'Perú Libre');

-- Batalla Perú (si existe como partido independiente)
UPDATE partidos_politicos 
SET 
  estado_semaforo_partidario = 'ROJO',
  tiene_investigacion_colectiva = true,
  tipo_investigacion_partidaria = 'CRIMEN_ORGANIZADO'
WHERE nombre LIKE '%Batalla%';

-- Voces del Pueblo - TERRORISMO
UPDATE partidos_politicos 
SET 
  estado_semaforo_partidario = 'ROJO',
  tiene_investigacion_colectiva = true,
  tipo_investigacion_partidaria = 'TERRORISMO'
WHERE nombre LIKE '%Voces del Pueblo%';

-- Actualizar alianzas con partidos problemáticos
UPDATE partidos_politicos 
SET 
  estado_semaforo_partidario = 'ROJO',
  tiene_investigacion_colectiva = true
WHERE nombre = 'Venceremos' AND es_alianza = true;

UPDATE partidos_politicos 
SET 
  estado_semaforo_partidario = 'ROJO',
  tiene_investigacion_colectiva = true
WHERE nombre = 'Fuerza y Libertad' AND es_alianza = true;

-- Actualizar partidos con semáforo AMARILLO (riesgo moderado)
UPDATE partidos_politicos 
SET 
  estado_semaforo_partidario = 'AMARILLO',
  tiene_investigacion_colectiva = true,
  tipo_investigacion_partidaria = 'FINANCIAMIENTO'
WHERE nombre IN ('Salvemos al Perú', 'Renovación Popular', 'Nuevo Perú');

UPDATE partidos_politicos 
SET 
  estado_semaforo_partidario = 'AMARILLO',
  tiene_investigacion_colectiva = true,
  tipo_investigacion_partidaria = 'FINANCIAMIENTO, CORRUPCION'
WHERE nombre IN ('Fuerza Moderna', 'Acción Popular');

-- Avanza País - Controversia membresía
UPDATE partidos_politicos 
SET 
  estado_semaforo_partidario = 'AMARILLO',
  tiene_investigacion_colectiva = false,
  tipo_investigacion_partidaria = 'ADMINISTRATIVO'
WHERE nombre = 'Avanza País';

-- Actualizar alianza Ahora Nación (AMARILLO por Salvemos al Perú)
UPDATE partidos_politicos 
SET 
  estado_semaforo_partidario = 'AMARILLO',
  tiene_investigacion_colectiva = true
WHERE nombre = 'Ahora Nación' AND es_alianza = true;

-- Verificar que el resto tenga VERDE por defecto (ya está por DEFAULT en la columna)
UPDATE partidos_politicos 
SET estado_semaforo_partidario = 'VERDE'
WHERE estado_semaforo_partidario IS NULL;
