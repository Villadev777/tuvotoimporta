import { Search, Filter, X } from 'lucide-react';
import type { SemaforoEstado } from '../types/database';

interface BarraBusquedaFiltrosProps {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  filtroSemaforo: SemaforoEstado | 'TODOS';
  onFiltroSemaforoChange: (valor: SemaforoEstado | 'TODOS') => void;
  filtroPartido: string;
  onFiltroPartidoChange: (valor: string) => void;
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
  partidosDisponibles,
  totalResultados,
  totalCandidatos,
}: BarraBusquedaFiltrosProps) {
  const hayFiltrosActivos = busqueda || filtroSemaforo !== 'TODOS' || filtroPartido !== 'TODOS';

  const limpiarFiltros = () => {
    onBusquedaChange('');
    onFiltroSemaforoChange('TODOS');
    onFiltroPartidoChange('TODOS');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl">
          <Filter size={20} className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Buscar y Filtrar</h3>
        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
          >
            <X size={16} />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar candidato por nombre..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Estado Judicial
          </label>
          <select
            value={filtroSemaforo}
            onChange={(e) => onFiltroSemaforoChange(e.target.value as SemaforoEstado | 'TODOS')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="VERDE">🟢 Verde - Sin investigaciones</option>
            <option value="AMARILLO">🟡 Amarillo - En investigación</option>
            <option value="ROJO">🔴 Rojo - Investigaciones graves</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Partido Político
          </label>
          <select
            value={filtroPartido}
            onChange={(e) => onFiltroPartidoChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-900">
          Mostrando <span className="font-bold">{totalResultados}</span> de{' '}
          <span className="font-bold">{totalCandidatos}</span> candidatos
        </div>
      )}
    </div>
  );
}
