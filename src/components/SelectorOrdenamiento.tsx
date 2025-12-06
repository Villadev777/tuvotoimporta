import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type TipoOrdenamiento =
  | 'nombre-asc'
  | 'nombre-desc'
  | 'votos-asc'
  | 'votos-desc'
  | 'semaforo-critico'
  | 'partido';

interface SelectorOrdenamientoProps {
  ordenamiento: TipoOrdenamiento;
  onOrdenamientoChange: (valor: TipoOrdenamiento) => void;
}

export function SelectorOrdenamiento({
  ordenamiento,
  onOrdenamientoChange,
}: SelectorOrdenamientoProps) {
  const opciones = [
    { valor: 'votos-desc', label: 'Más votados primero', icon: ArrowDown },
    { valor: 'votos-asc', label: 'Menos votados primero', icon: ArrowUp },
    { valor: 'nombre-asc', label: 'Nombre (A-Z)', icon: ArrowUp },
    { valor: 'nombre-desc', label: 'Nombre (Z-A)', icon: ArrowDown },
    { valor: 'semaforo-critico', label: 'Estado crítico primero', icon: ArrowDown },
    { valor: 'partido', label: 'Por partido', icon: ArrowUpDown },
  ];

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-gray-700">
        <ArrowUpDown size={18} />
        <span className="text-sm font-semibold">Ordenar:</span>
      </div>
      <select
        value={ordenamiento}
        onChange={(e) => onOrdenamientoChange(e.target.value as TipoOrdenamiento)}
        className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm font-medium"
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.label}
          </option>
        ))}
      </select>
    </div>
  );
}
