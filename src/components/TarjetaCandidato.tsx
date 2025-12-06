import { Users, Eye, AlertTriangle, ChevronRight } from 'lucide-react';
import type { CandidatoConPartido } from '../types/database';
import { SemaforoIndicador } from './SemaforoIndicador';
import { formatearNumero } from '../lib/utils';

interface TarjetaCandidatoProps {
  candidato: CandidatoConPartido;
  onVerDetalles: (candidato: CandidatoConPartido) => void;
  onVotar: (candidato: CandidatoConPartido) => void;
  haVotado: boolean;
}

export function TarjetaCandidato({
  candidato,
  onVerDetalles,
  onVotar,
  haVotado,
}: TarjetaCandidatoProps) {
  const numInvestigaciones = candidato.investigaciones?.length || 0;

  return (
    <article
      className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
      aria-label={`Candidato: ${candidato.nombre_completo}`}
    >
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center overflow-hidden ring-2 sm:ring-4 ring-white dark:ring-gray-800 shadow-lg">
              {candidato.url_foto ? (
                <img
                  src={candidato.url_foto}
                  alt={candidato.nombre_completo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users size={28} className="text-blue-600 sm:w-9 sm:h-9" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
              {candidato.nombre_completo}
            </h3>
            {candidato.partido && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                <span className="font-semibold">{candidato.partido.sigla}</span>
              </p>
            )}

            <div className="mb-2 space-y-1">
              <SemaforoIndicador estado={candidato.estado_semaforo} tamaño="pequeño" />
              {candidato.partido?.estado_semaforo_partidario &&
               candidato.partido.estado_semaforo_partidario !== 'VERDE' && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Partido:</span>
                  <SemaforoIndicador
                    estado={candidato.partido.estado_semaforo_partidario}
                    tamaño="pequeño"
                    mostrarTooltip={true}
                  />
                </div>
              )}
            </div>

            {numInvestigaciones > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-lg border border-orange-200 dark:border-orange-800 w-fit">
                <AlertTriangle size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="font-medium">{numInvestigaciones} inv{numInvestigaciones > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {candidato.biografia_breve && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {candidato.biografia_breve}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-700 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-200 dark:border-gray-600">
          <Users size={14} className="text-gray-500 dark:text-gray-400 sm:w-4 sm:h-4" />
          <span className="font-bold text-gray-900 dark:text-white">{formatearNumero(candidato.total_votos)}</span>
          <span className="text-gray-500 dark:text-gray-400">votos</span>
        </div>

        <div className="flex gap-2 pt-1 sm:pt-2">
          <button
            onClick={() => onVerDetalles(candidato)}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center gap-1.5 sm:gap-2 group/btn text-sm sm:text-base min-h-[44px]"
            aria-label={`Ver detalles de ${candidato.nombre_completo}`}
          >
            <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span>Detalles</span>
            <ChevronRight size={14} className="opacity-0 group-hover/btn:opacity-100 transition-opacity sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onVotar(candidato)}
            disabled={haVotado}
            className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold transition-all transform text-sm sm:text-base min-h-[44px] ${
              haVotado
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-105'
            }`}
            aria-label={haVotado ? 'Ya has votado' : `Votar por ${candidato.nombre_completo}`}
          >
            {haVotado ? 'Votado ✓' : 'Votar'}
          </button>
        </div>
      </div>
    </article>
  );
}
