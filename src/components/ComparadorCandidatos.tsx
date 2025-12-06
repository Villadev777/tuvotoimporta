import { X, Users, Scale, CheckCircle } from 'lucide-react';
import type { CandidatoConPartido } from '../types/database';
import { SemaforoIndicador } from './SemaforoIndicador';
import { formatearNumero } from '../lib/utils';

interface ComparadorCandidatosProps {
  candidatos: CandidatoConPartido[];
  onCerrar: () => void;
  onRemoverCandidato: (candidatoId: string) => void;
}

export function ComparadorCandidatos({
  candidatos,
  onCerrar,
  onRemoverCandidato,
}: ComparadorCandidatosProps) {
  if (candidatos.length === 0) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onCerrar}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0">
              <Scale size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Comparar Candidatos</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Comparando {candidatos.length} candidato{candidatos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {candidatos.map((candidato) => (
              <div
                key={candidato.id}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden relative"
              >
                <button
                  onClick={() => onRemoverCandidato(candidato.id)}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors z-10 min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label={`Remover a ${candidato.nombre_completo}`}
                >
                  <X size={14} className="sm:w-4 sm:h-4" />
                </button>

                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center overflow-hidden ring-2 sm:ring-4 ring-white dark:ring-gray-800 shadow-lg mb-2 sm:mb-3">
                      {candidato.url_foto ? (
                        <img
                          src={candidato.url_foto}
                          alt={candidato.nombre_completo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={40} className="text-blue-600 sm:w-12 sm:h-12" />
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {candidato.nombre_completo}
                    </h3>
                    {candidato.partido && (
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 truncate max-w-full">
                        {candidato.partido.sigla}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Estado Judicial</p>
                      <SemaforoIndicador estado={candidato.estado_semaforo} tamaño="pequeño" />
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Votos Obtenidos</p>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Users size={14} className="text-gray-500 dark:text-gray-400 sm:w-4 sm:h-4" />
                        <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                          {formatearNumero(candidato.total_votos)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 font-medium">Investigaciones</p>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Scale size={14} className="text-gray-500 dark:text-gray-400 sm:w-4 sm:h-4" />
                        <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                          {candidato.investigaciones?.length || 0}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">activas</span>
                      </div>
                    </div>

                    {candidato.partido && (
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Partido</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {candidato.partido.nombre}
                        </p>
                        {candidato.partido.ideologia && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                            {candidato.partido.ideologia}
                          </p>
                        )}
                      </div>
                    )}

                    {candidato.propuestas_clave && candidato.propuestas_clave.length > 0 && (
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-2.5 sm:p-3 border border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-2 font-medium">Propuestas Clave</p>
                        <ul className="space-y-1.5">
                          {candidato.propuestas_clave.slice(0, 3).map((propuesta, index) => (
                            <li key={index} className="flex items-start gap-1.5 sm:gap-2 text-xs">
                              <CheckCircle size={12} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 sm:w-[14px] sm:h-[14px]" />
                              <span className="text-gray-700 dark:text-gray-300 line-clamp-2">{propuesta}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {candidatos.length < 3 && (
            <div className="mt-4 sm:mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-300">
                Puedes comparar hasta 3 candidatos. Selecciona más desde la lista principal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
