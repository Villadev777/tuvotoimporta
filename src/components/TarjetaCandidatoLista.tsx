import { Users, Eye, AlertTriangle } from 'lucide-react';
import type { CandidatoConPartido } from '../types/database';
import { SemaforoIndicador } from './SemaforoIndicador';
import { formatearNumero } from '../lib/utils';

interface TarjetaCandidatoListaProps {
  candidato: CandidatoConPartido;
  onVerDetalles: (candidato: CandidatoConPartido) => void;
  onVotar: (candidato: CandidatoConPartido) => void;
  haVotado: boolean;
}

export function TarjetaCandidatoLista({
  candidato,
  onVerDetalles,
  onVotar,
  haVotado,
}: TarjetaCandidatoListaProps) {
  const numInvestigaciones = candidato.investigaciones?.length || 0;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0 relative">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow">
                {candidato.url_foto ? (
                  <img
                    src={candidato.url_foto}
                    alt={candidato.nombre_completo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users size={24} className="text-blue-600 sm:w-7 sm:h-7" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                {candidato.nombre_completo}
              </h3>
              {candidato.partido && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  <span className="font-semibold">{candidato.partido.sigla}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 sm:flex-1 sm:justify-end">
            <div className="flex-shrink-0">
              <SemaforoIndicador estado={candidato.estado_semaforo} tamaño="pequeño" />
            </div>

            {numInvestigaciones > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-lg border border-orange-200 dark:border-orange-800">
                <AlertTriangle size={12} />
                <span className="font-medium">{numInvestigaciones} inv.</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
              <Users size={12} className="text-gray-500 dark:text-gray-400 sm:w-[14px] sm:h-[14px]" />
              <span className="font-bold text-gray-900 dark:text-white">{formatearNumero(candidato.total_votos)}</span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => onVerDetalles(candidato)}
                className="flex-1 sm:flex-none px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm min-h-[44px]"
              >
                <Eye size={14} className="sm:w-4 sm:h-4" />
                <span>Ver</span>
              </button>
              <button
                onClick={() => onVotar(candidato)}
                disabled={haVotado}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold transition-all text-xs sm:text-sm min-h-[44px] ${
                  haVotado
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow hover:shadow-md'
                }`}
              >
                {haVotado ? '✓' : 'Votar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
