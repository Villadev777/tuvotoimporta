import { TrendingUp, Users, Crown, Medal, Award } from 'lucide-react';
import type { ResultadoEncuesta } from '../types/database';
import { formatearNumero, formatearPorcentaje, obtenerIconoSemaforo } from '../lib/utils';

interface ResultadosEncuestaProps {
  resultados: ResultadoEncuesta[];
  totalVotos: number;
}

export function ResultadosEncuesta({ resultados, totalVotos }: ResultadosEncuestaProps) {
  const top5 = resultados.slice(0, 5);

  const getPosicionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown size={24} className="text-yellow-500" />;
      case 1:
        return <Medal size={24} className="text-gray-400" />;
      case 2:
        return <Award size={24} className="text-orange-600" />;
      default:
        return null;
    }
  };

  const getPosicionColor = (index: number) => {
    switch (index) {
      case 0:
        return 'from-yellow-400 to-yellow-600';
      case 1:
        return 'from-gray-300 to-gray-500';
      case 2:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <TrendingUp size={32} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black">Resultados en Vivo</h2>
              <p className="text-blue-100 text-sm">Actualización en tiempo real</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border-2 border-white/30">
            <p className="text-sm text-blue-100 font-medium mb-1">Total de votos</p>
            <p className="text-3xl font-black flex items-center gap-2">
              <Users size={28} />
              {formatearNumero(totalVotos)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {top5.map((resultado, index) => {
          const ancho = totalVotos > 0 ? (resultado.total_votos / totalVotos) * 100 : 0;
          const isTop3 = index < 3;

          return (
            <div
              key={resultado.candidato_id}
              className={`space-y-3 p-4 rounded-xl transition-all ${
                isTop3 ? 'bg-gradient-to-r from-blue-50 to-transparent border-2 border-blue-100' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isTop3 ? (
                      getPosicionIcon(index)
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-2xl">{obtenerIconoSemaforo(resultado.estado_semaforo)}</div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-lg">
                      {resultado.nombre_completo}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{resultado.partido_nombre}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-3xl font-black text-blue-600">
                    {formatearPorcentaje(resultado.porcentaje)}%
                  </p>
                  <p className="text-sm text-gray-500 font-semibold">
                    {formatearNumero(resultado.total_votos)} votos
                  </p>
                </div>
              </div>

              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getPosicionColor(index)} rounded-full transition-all duration-700 ease-out shadow-lg`}
                  style={{ width: `${ancho}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {resultados.length > 5 && (
        <div className="bg-gray-50 border-t-2 border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-600 text-center font-medium">
            Mostrando el top 5 de {resultados.length} candidatos
          </p>
        </div>
      )}
    </div>
  );
}
