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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCerrar}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {candidato.nombre_completo}
            </h2>
            {candidato.partido && (
              <p className="text-gray-600">
                {candidato.partido.nombre} ({candidato.partido.sigla})
              </p>
            )}
          </div>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
              {candidato.url_foto ? (
                <img
                  src={candidato.url_foto}
                  alt={candidato.nombre_completo}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users size={60} className="text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="mb-3">
                <SemaforoIndicador estado={candidato.estado_semaforo} tamaño="mediano" />
              </div>
              <p className="text-sm text-gray-500">
                Última actualización: {formatearFecha(candidato.fecha_actualizacion_estado_legal)}
              </p>
            </div>
          </div>

          {candidato.biografia_breve && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Biografía</h3>
              <p className="text-gray-700 leading-relaxed">{candidato.biografia_breve}</p>
            </div>
          )}

          {candidato.partido && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users size={20} />
                Partido Político
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900 mb-1">{candidato.partido.nombre}</p>
                <p className="text-sm text-gray-600 mb-2">{candidato.partido.descripcion}</p>
                {candidato.partido.ideologia && (
                  <p className="text-sm text-gray-500">
                    Ideología: <span className="font-medium">{candidato.partido.ideologia}</span>
                  </p>
                )}
                {candidato.partido.url_oficial && (
                  <a
                    href={candidato.partido.url_oficial}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Sitio web oficial <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          )}

          {candidato.plan_gobierno && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Plan de Gobierno</h3>
              <p className="text-gray-700 leading-relaxed">{candidato.plan_gobierno}</p>
            </div>
          )}

          {candidato.propuestas_clave && candidato.propuestas_clave.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Propuestas Clave</h3>
              <ul className="space-y-2">
                {candidato.propuestas_clave.map((propuesta, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span className="text-gray-700">{propuesta}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {candidato.investigaciones && candidato.investigaciones.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Scale size={20} />
                Investigaciones Judiciales
              </h3>
              <div className="space-y-3">
                {candidato.investigaciones.map((inv) => (
                  <div key={inv.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                        {inv.tipo}
                      </span>
                      <span className="text-xs text-gray-500">{inv.estado}</span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium mb-1">{inv.descripcion}</p>
                    {inv.organismo_investigador && (
                      <p className="text-xs text-gray-600 mb-1">
                        Organismo: {inv.organismo_investigador}
                      </p>
                    )}
                    {inv.numero_expediente && (
                      <p className="text-xs text-gray-600 mb-1">
                        Expediente: {inv.numero_expediente}
                      </p>
                    )}
                    {inv.fecha_inicio && (
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatearFecha(inv.fecha_inicio)}
                      </p>
                    )}
                    {inv.url_verificacion && (
                      <a
                        href={inv.url_verificacion}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2"
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
            <div className="pt-4 border-t border-gray-200">
              <a
                href={candidato.url_plataforma_jne}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver perfil completo en JNE <ExternalLink size={18} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
