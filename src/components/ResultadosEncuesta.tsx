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
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
              <TrendingUp size={24} className="sm:w-8 sm:h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black">Resultados en Vivo</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Actualización en tiempo real</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-3 border-2 border-white/30">
            <p className="text-xs sm:text-sm text-blue-100 font-medium mb-1">Total de votos</p>
            <p className="text-2xl sm:text-3xl font-black flex items-center gap-1.5 sm:gap-2">
              <Users size={20} className="sm:w-7 sm:h-7" />
              {formatearNumero(totalVotos)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6 space-y-3 sm:space-y-5">
        {top5.map((resultado, index) => {
          const ancho = totalVotos > 0 ? (resultado.total_votos / totalVotos) * 100 : 0;
          const isTop3 = index < 3;

          return (
            <div
              key={resultado.candidato_id}
              className={`space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all ${
                isTop3 ? 'bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 border-2 border-blue-100 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {isTop3 ? (
                      <div className="scale-75 sm:scale-100">{getPosicionIcon(index)}</div>
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm sm:text-lg font-bold text-gray-600 dark:text-gray-300">#{index + 1}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xl sm:text-2xl flex-shrink-0">{obtenerIconoSemaforo(resultado.estado_semaforo)}</div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-lg">
                      {resultado.nombre_completo}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{resultado.partido_nombre}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-10 sm:ml-0">
                  <p className="text-2xl sm:text-3xl font-black text-blue-600">
                    {formatearPorcentaje(resultado.porcentaje)}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold">
                    {formatearNumero(resultado.total_votos)} votos
                  </p>
                </div>
              </div>

              <div className="relative h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden shadow-inner">
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
