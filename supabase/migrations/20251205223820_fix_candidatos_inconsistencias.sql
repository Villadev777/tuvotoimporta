/*
  # Corrección de inconsistencias en candidatos

  1. Eliminaciones
    - Antauro Humala: Su partido A.N.T.A.U.R.O fue declarado ILEGAL por la Corte Suprema
    
  2. Correcciones de Partidos
    - Yonhy Lescano: Debe estar en Acción Popular (no Avanza País)
    
  3. Notas Importantes
    - Algunos partidos tienen múltiples precandidatos (primarias internas)
    - Podemos Perú: José Luna Gálvez es el candidato oficial
    - Avanza País: Phillip Butters y Nicanor Boluarte (posibles primarias)
    - Acción Popular: Julio Chávez Chiong y Yonhy Lescano (posibles primarias)
*/

-- Desactivar Antauro Humala (partido declarado ILEGAL)
UPDATE candidatos 
SET activo = false 
WHERE nombre_completo = 'Antauro Humala';

-- Eliminar investigaciones de Antauro Humala para mantener limpieza de datos
DELETE FROM investigaciones_judiciales 
WHERE candidato_id = (SELECT id FROM candidatos WHERE nombre_completo = 'Antauro Humala');

-- Corregir partido de Yonhy Lescano: debe estar en Acción Popular
DO $$
DECLARE
  v_accion_popular_id uuid;
  v_lescano_id uuid;
BEGIN
  -- Obtener ID de Acción Popular (buscar por nombre completo ya que sigla está duplicada)
  SELECT id INTO v_accion_popular_id 
  FROM partidos_politicos 
  WHERE nombre = 'Acción Popular'
  LIMIT 1;

  -- Si no existe, buscar por sigla APo
  IF v_accion_popular_id IS NULL THEN
    SELECT id INTO v_accion_popular_id 
    FROM partidos_politicos 
    WHERE sigla = 'APo';
  END IF;

  -- Obtener ID de Yonhy Lescano
  SELECT id INTO v_lescano_id 
  FROM candidatos 
  WHERE nombre_completo = 'Yonhy Lescano';

  -- Actualizar partido si encontramos ambos IDs
  IF v_accion_popular_id IS NOT NULL AND v_lescano_id IS NOT NULL THEN
    UPDATE candidatos 
    SET partido_id = v_accion_popular_id 
    WHERE id = v_lescano_id;
  END IF;
END $$;

-- Agregar nota sobre Daniel Urresti: Es un precandidato diferente, no del mismo partido que Luna Gálvez
-- Necesita su propio registro en un partido diferente o como independiente
-- Por ahora lo dejamos como está ya que podría ser precandidato en primarias
