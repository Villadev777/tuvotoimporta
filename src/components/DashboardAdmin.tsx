import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, Users, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EstadisticasSeguridad {
  votos_exitosos: number;
  votos_rechazados: number;
  avg_trust_score: number;
  avg_recaptcha_score: number;
  ips_unicas: number;
  dispositivos_unicos: number;
  intentos_ultima_hora: number;
}

interface VotoPendiente {
  id: string;
  candidato_nombre: string;
  motivo_sospecha: string;
  trust_score: number;
  created_at: string;
}

interface VotoPendienteDB {
  id: string;
  motivo_sospecha: string;
  trust_score: number;
  created_at: string;
  candidato_id: string;
}

interface PatronSospechoso {
  id: string;
  tipo_patron: string;
  descripcion: string;
  nivel_riesgo: string;
  votos_afectados: number;
  detectado_en: string;
}

export function DashboardAdmin() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasSeguridad | null>(null);
  const [votosPendientes, setVotosPendientes] = useState<VotoPendiente[]>([]);
  const [patrones, setPatrones] = useState<PatronSospechoso[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);

      const { data: statsData } = await supabase
        .from('estadisticas_seguridad')
        .select('*')
        .maybeSingle();

      if (statsData) {
        setEstadisticas(statsData);
      }

      const { data: pendientesData } = await supabase
        .from('votos_pendientes')
        .select(`
          id,
          motivo_sospecha,
          trust_score,
          created_at,
          candidato_id
        `)
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: false })
        .limit(10);

      if (pendientesData) {
        const votosConCandidato = await Promise.all(
          (pendientesData as VotoPendienteDB[]).map(async (voto) => {
            const { data: candidato } = await supabase
              .from('candidatos')
              .select('nombre_completo')
              .eq('id', voto.candidato_id)
              .maybeSingle();

            const candidatoData = candidato as { nombre_completo: string } | null;

            return {
              id: voto.id,
              motivo_sospecha: voto.motivo_sospecha,
              trust_score: voto.trust_score,
              created_at: voto.created_at,
              candidato_nombre: candidatoData?.nombre_completo || 'Desconocido',
            } as VotoPendiente;
          })
        );
        setVotosPendientes(votosConCandidato);
      }

      const { data: patronesData } = await supabase
        .from('patrones_sospechosos')
        .select('*')
        .order('detectado_en', { ascending: false })
        .limit(5);

      if (patronesData) {
        setPatrones(patronesData);
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setCargando(false);
    }
  }

  const nivelRiesgoColor = (nivel: string) => {
    switch (nivel) {
      case 'critico':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'alto':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'bajo':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (cargando && !estadisticas) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            Dashboard de Seguridad
          </h1>
          <p className="text-gray-600 mt-2">
            Monitoreo en tiempo real del sistema anti-fraude
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Votos Exitosos</div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {estadisticas?.votos_exitosos || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Votos Rechazados</div>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {estadisticas?.votos_rechazados || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">IPs Únicas</div>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {estadisticas?.ips_unicas || 0}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Actividad Reciente</div>
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {estadisticas?.intentos_ultima_hora || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">última hora</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Trust Score Promedio</h3>
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {estadisticas?.avg_trust_score?.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-gray-500 mt-2">De 100 puntos</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">reCAPTCHA Score</h3>
            </div>
            <div className="text-4xl font-bold text-green-600">
              {estadisticas?.avg_recaptcha_score?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-500 mt-2">De 1.0 puntos</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Dispositivos Únicos</h3>
            </div>
            <div className="text-4xl font-bold text-purple-600">
              {estadisticas?.dispositivos_unicos || 0}
            </div>
            <div className="text-sm text-gray-500 mt-2">Fingerprints detectados</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Votos Pendientes de Revisión
              </h3>
            </div>

            {votosPendientes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay votos pendientes</p>
            ) : (
              <div className="space-y-3">
                {votosPendientes.map((voto) => (
                  <div
                    key={voto.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">{voto.candidato_nombre}</div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-orange-100 text-orange-800">
                        Trust: {voto.trust_score?.toFixed(0)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{voto.motivo_sospecha}</p>
                    <div className="text-xs text-gray-500">
                      {new Date(voto.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Patrones Sospechosos</h3>
            </div>

            {patrones.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No se detectaron patrones sospechosos</p>
            ) : (
              <div className="space-y-3">
                {patrones.map((patron) => (
                  <div
                    key={patron.id}
                    className={`border rounded-lg p-4 ${nivelRiesgoColor(patron.nivel_riesgo)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold text-sm uppercase tracking-wide">
                        {patron.tipo_patron.replace('_', ' ')}
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-white bg-opacity-50">
                        {patron.votos_afectados} votos
                      </span>
                    </div>
                    <p className="text-sm mb-2">{patron.descripcion}</p>
                    <div className="text-xs opacity-75">
                      {new Date(patron.detectado_en).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Sistema de Seguridad Activo</h4>
              <p className="text-sm text-blue-700">
                El sistema está monitoreando activamente todos los intentos de votación. Los votos con
                trust score bajo son bloqueados automáticamente. Los votos con score medio son
                enviados a revisión manual.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
