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
    <div className="group bg-white rounded-xl shadow-md border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0 relative">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden ring-2 ring-white shadow">
            {candidato.url_foto ? (
              <img
                src={candidato.url_foto}
                alt={candidato.nombre_completo}
                className="w-full h-full object-cover"
              />
            ) : (
              <Users size={28} className="text-blue-600" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {candidato.nombre_completo}
            </h3>
            {candidato.partido && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{candidato.partido.sigla}</span>
              </p>
            )}
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <SemaforoIndicador estado={candidato.estado_semaforo} tamaño="pequeño" />
          </div>

          <div className="md:col-span-2">
            {numInvestigaciones > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-200 w-fit">
                <AlertTriangle size={12} />
                <span className="font-medium">{numInvestigaciones} inv.</span>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-1.5 text-sm">
              <Users size={14} className="text-gray-500" />
              <span className="font-bold text-gray-900">{formatearNumero(candidato.total_votos)}</span>
            </div>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={() => onVerDetalles(candidato)}
              className="flex-1 md:flex-none px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all flex items-center justify-center gap-1 text-sm"
            >
              <Eye size={16} />
              <span className="hidden md:inline">Ver</span>
            </button>
            <button
              onClick={() => onVotar(candidato)}
              disabled={haVotado}
              className={`flex-1 md:flex-none px-3 py-2 rounded-lg font-bold transition-all text-sm ${
                haVotado
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow hover:shadow-md'
              }`}
            >
              {haVotado ? '✓' : 'Votar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
