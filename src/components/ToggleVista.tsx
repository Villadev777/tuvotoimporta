import { Grid3x3, List } from 'lucide-react';

export type TipoVista = 'grid' | 'lista';

interface ToggleVistaProps {
  vista: TipoVista;
  onVistaChange: (vista: TipoVista) => void;
}

export function ToggleVista({ vista, onVistaChange }: ToggleVistaProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
      <button
        onClick={() => onVistaChange('grid')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          vista === 'grid'
            ? 'bg-white text-blue-600 shadow-md font-semibold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Grid3x3 size={18} />
        <span className="text-sm">Tarjetas</span>
      </button>
      <button
        onClick={() => onVistaChange('lista')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          vista === 'lista'
            ? 'bg-white text-blue-600 shadow-md font-semibold'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <List size={18} />
        <span className="text-sm">Lista</span>
      </button>
    </div>
  );
}
