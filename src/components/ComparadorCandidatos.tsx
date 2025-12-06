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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
              <Scale size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Comparar Candidatos</h2>
              <p className="text-sm text-gray-600">
                Comparando {candidatos.length} candidato{candidatos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidatos.map((candidato) => (
              <div
                key={candidato.id}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 overflow-hidden relative"
              >
                <button
                  onClick={() => onRemoverCandidato(candidato.id)}
                  className="absolute top-3 right-3 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors z-10"
                >
                  <X size={16} />
                </button>

                <div className="p-6 space-y-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg mb-3">
                      {candidato.url_foto ? (
                        <img
                          src={candidato.url_foto}
                          alt={candidato.nombre_completo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={48} className="text-blue-600" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {candidato.nombre_completo}
                    </h3>
                    {candidato.partido && (
                      <p className="text-sm font-semibold text-gray-600 mb-3">
                        {candidato.partido.sigla}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Estado Judicial</p>
                      <SemaforoIndicador estado={candidato.estado_semaforo} tamaño="pequeño" />
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1 font-medium">Votos Obtenidos</p>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-500" />
                        <span className="text-lg font-bold text-gray-900">
                          {formatearNumero(candidato.total_votos)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Investigaciones</p>
                      <div className="flex items-center gap-2">
                        <Scale size={16} className="text-gray-500" />
                        <span className="font-bold text-gray-900">
                          {candidato.investigaciones?.length || 0}
                        </span>
                        <span className="text-sm text-gray-600">activas</span>
                      </div>
                    </div>

                    {candidato.partido && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 font-medium">Partido</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {candidato.partido.nombre}
                        </p>
                        {candidato.partido.ideologia && (
                          <p className="text-xs text-gray-600 mt-1">
                            {candidato.partido.ideologia}
                          </p>
                        )}
                      </div>
                    )}

                    {candidato.propuestas_clave && candidato.propuestas_clave.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2 font-medium">Propuestas Clave</p>
                        <ul className="space-y-1.5">
                          {candidato.propuestas_clave.slice(0, 3).map((propuesta, index) => (
                            <li key={index} className="flex items-start gap-2 text-xs">
                              <CheckCircle size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 line-clamp-2">{propuesta}</span>
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
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-900">
                Puedes comparar hasta 3 candidatos. Selecciona más desde la lista principal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
