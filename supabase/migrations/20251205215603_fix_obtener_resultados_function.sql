/*
  # Fix obtener_resultados_encuesta function
  
  Corrige la ambigüedad en la referencia a total_votos especificando
  explícitamente el alias de la tabla.
*/

CREATE OR REPLACE FUNCTION obtener_resultados_encuesta()
RETURNS TABLE (
  candidato_id uuid,
  nombre_completo text,
  partido_nombre text,
  estado_semaforo text,
  total_votos bigint,
  porcentaje decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as candidato_id,
    c.nombre_completo,
    p.nombre as partido_nombre,
    c.estado_semaforo,
    c.total_votos::bigint as total_votos,
    CASE 
      WHEN (SELECT SUM(c2.total_votos) FROM candidatos c2 WHERE c2.activo = true) > 0
      THEN (c.total_votos::decimal / (SELECT SUM(c2.total_votos) FROM candidatos c2 WHERE c2.activo = true)::decimal * 100)
      ELSE 0
    END as porcentaje
  FROM candidatos c
  LEFT JOIN partidos_politicos p ON c.partido_id = p.id
  WHERE c.activo = true
  ORDER BY c.total_votos DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;