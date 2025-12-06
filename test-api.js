import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAPI() {
  console.log('Testing candidatos query...');
  
  const { data, error } = await supabase
    .from('candidatos')
    .select(`
      *,
      partido:partidos_politicos(*),
      investigaciones:investigaciones_judiciales(*)
    `)
    .eq('activo', true)
    .order('nombre_completo');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Total candidatos: ${data.length}`);
    data.forEach(c => console.log(`- ${c.nombre_completo} (${c.estado_semaforo})`));
  }
}

testAPI();
