import { X, Users, Scale, Calendar, ExternalLink } from 'lucide-react';
import type { CandidatoConPartido } from '../types/database';
import { SemaforoIndicador } from './SemaforoIndicador';
import { formatearFecha } from '../lib/utils';

interface ModalDetallesCandidatoProps {
  candidato: CandidatoConPartido;
  onCerrar: () => void;
}

export function ModalDetallesCandidato({ candidato, onCerrar }: ModalDetallesCandidatoProps) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 line-clamp-2">
              {candidato.nombre_completo}
            </h2>
            {candidato.partido && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
                {candidato.partido.nombre} ({candidato.partido.sigla})
              </p>
            )}
          </div>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center overflow-hidden mx-auto sm:mx-0 flex-shrink-0">
              {candidato.url_foto ? (
                <img
                  src={candidato.url_foto}
                  alt={candidato.nombre_completo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users size={48} className="text-blue-600 sm:w-[60px] sm:h-[60px]" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-2 sm:mb-3 flex justify-center sm:justify-start">
                <SemaforoIndicador estado={candidato.estado_semaforo} tamaño="mediano" />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Última actualización: {formatearFecha(candidato.fecha_actualizacion_estado_legal)}
              </p>
            </div>
          </div>

          {candidato.biografia_breve && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Biografía</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{candidato.biografia_breve}</p>
            </div>
          )}

          {candidato.partido && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Users size={18} className="sm:w-5 sm:h-5" />
                Partido Político
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                <p className="font-medium text-gray-900 dark:text-white mb-1 text-sm sm:text-base">{candidato.partido.nombre}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{candidato.partido.descripcion}</p>
                {candidato.partido.ideologia && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Ideología: <span className="font-medium">{candidato.partido.ideologia}</span>
                  </p>
                )}
                {candidato.partido.estado_semaforo_partidario && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Semáforo Partidario:</p>
                    <SemaforoIndicador estado={candidato.partido.estado_semaforo_partidario} tamaño="pequeño" />
                  </div>
                )}
                {candidato.partido.url_oficial && (
                  <a
                    href={candidato.partido.url_oficial}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 min-h-[44px] py-2"
                  >
                    Sitio web oficial <ExternalLink size={12} className="sm:w-[14px] sm:h-[14px]" />
                  </a>
                )}
              </div>
            </div>
          )}

          {candidato.plan_gobierno && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Plan de Gobierno</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{candidato.plan_gobierno}</p>
            </div>
          )}

          {candidato.propuestas_clave && candidato.propuestas_clave.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">Propuestas Clave</h3>
              <ul className="space-y-2">
                {candidato.propuestas_clave.map((propuesta, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">{propuesta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {candidato.partido?.investigaciones_partidarias && candidato.partido.investigaciones_partidarias.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Scale size={18} className="sm:w-5 sm:h-5" />
                Investigaciones del Partido
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {candidato.partido.investigaciones_partidarias.map((inv) => (
                  <div key={inv.id} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                      <span className="inline-block px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-xs font-medium rounded w-fit">
                        {inv.tipo_investigacion}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{inv.estado_actual}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mb-1">{inv.descripcion_detallada}</p>
                    {inv.organizacion_investigadora && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Organismo: {inv.organizacion_investigadora}
                      </p>
                    )}
                    {inv.fecha_inicio && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatearFecha(inv.fecha_inicio)}
                      </p>
                    )}
                    {inv.url_verificacion && (
                      <a
                        href={inv.url_verificacion}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 min-h-[44px] py-2"
                      >
                        Fuente oficial <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {candidato.investigaciones && candidato.investigaciones.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Scale size={18} className="sm:w-5 sm:h-5" />
                Investigaciones del Candidato
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {candidato.investigaciones.map((inv) => (
                  <div key={inv.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                      <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium rounded w-fit">
                        {inv.tipo}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{inv.estado}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mb-1">{inv.descripcion}</p>
                    {inv.organismo_investigador && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Organismo: {inv.organismo_investigador}
                      </p>
                    )}
                    {inv.numero_expediente && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Expediente: {inv.numero_expediente}
                      </p>
                    )}
                    {inv.fecha_inicio && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatearFecha(inv.fecha_inicio)}
                      </p>
                    )}
                    {inv.url_verificacion && (
                      <a
                        href={inv.url_verificacion}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 min-h-[44px] py-2"
                      >
                        Fuente oficial <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {candidato.url_plataforma_jne && (
            <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <a
                href={candidato.url_plataforma_jne}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium min-h-[44px] py-2"
              >
                Ver perfil completo en JNE <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
