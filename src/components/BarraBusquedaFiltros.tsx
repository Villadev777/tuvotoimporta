import { Search, Filter, X } from 'lucide-react';
import type { SemaforoEstado, TipoCandidato } from '../types/database';

interface BarraBusquedaFiltrosProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  filtroSemaforo: SemaforoEstado | 'TODOS';
  onFiltroSemaforoChange: (valor: SemaforoEstado | 'TODOS') => void;
  filtroPartido: string;
  onFiltroPartidoChange: (valor: string) => void;
  filtroTipoCandidato: TipoCandidato | 'TODOS';
  onFiltroTipoCandidatoChange: (valor: TipoCandidato | 'TODOS') => void;
  partidosDisponibles: { id: string; nombre: string; sigla: string }[];
  totalResultados: number;
  totalCandidatos: number;
}

export function BarraBusquedaFiltros({
  busqueda,
  onBusquedaChange,
  filtroSemaforo,
  onFiltroSemaforoChange,
  filtroPartido,
  onFiltroPartidoChange,
  filtroTipoCandidato,
  onFiltroTipoCandidatoChange,
  partidosDisponibles,
  totalResultados,
  totalCandidatos,
}: BarraBusquedaFiltrosProps) {
  const hayFiltrosActivos = busqueda || filtroSemaforo !== 'TODOS' || filtroPartido !== 'TODOS' || filtroTipoCandidato !== 'TODOS';

  const limpiarFiltros = () => {
    onBusquedaChange('');
    onFiltroSemaforoChange('TODOS');
    onFiltroPartidoChange('TODOS');
    onFiltroTipoCandidatoChange('TODOS');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 sm:p-2.5 rounded-lg sm:rounded-xl flex-shrink-0">
            <Filter size={18} className="text-white sm:w-5 sm:h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Buscar y Filtrar</h3>
        </div>
        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs sm:text-sm rounded-lg transition-colors min-h-[44px]"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 sm:w-5 sm:h-5"
        />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar candidato por nombre..."
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base min-h-[48px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
            Tipo de Candidato
          </label>
          <select
            value={filtroTipoCandidato}
            onChange={(e) => onFiltroTipoCandidatoChange(e.target.value as TipoCandidato | 'TODOS')}
            className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base min-h-[48px]"
          >
            <option value="TODOS">Todos los candidatos</option>
            <option value="PRECANDIDATO_OFICIAL">✓ Oficial ONPE</option>
            <option value="EN_DEFINICION">⏳ En Primarias</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
            Estado Judicial
          </label>
          <select
            value={filtroSemaforo}
            onChange={(e) => onFiltroSemaforoChange(e.target.value as SemaforoEstado | 'TODOS')}
            className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base min-h-[48px]"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="VERDE">🟢 Verde - Sin investigaciones</option>
            <option value="AMARILLO">🟡 Amarillo - En investigación</option>
            <option value="ROJO">🔴 Rojo - Investigaciones graves</option>
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
            Partido Político
          </label>
          <select
            value={filtroPartido}
            onChange={(e) => onFiltroPartidoChange(e.target.value)}
            className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base min-h-[48px]"
          >
            <option value="TODOS">Todos los partidos</option>
            {partidosDisponibles.map((partido) => (
              <option key={partido.id} value={partido.id}>
                {partido.sigla} - {partido.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hayFiltrosActivos && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm text-blue-900 dark:text-blue-300">
          Mostrando <span className="font-bold">{totalResultados}</span> de{' '}
          <span className="font-bold">{totalCandidatos}</span> candidatos
        </div>
      )}
    </div>
  );
}
