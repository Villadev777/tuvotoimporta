import { Grid3x3, List } from 'lucide-react';

export type TipoVista = 'grid' | 'lista';

interface ToggleVistaProps {
  vista: TipoVista;
  onVistaChange: (vista: TipoVista) => void;
}

export function ToggleVista({ vista, onVistaChange }: ToggleVistaProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-white/10 sm:bg-gray-100 dark:sm:bg-gray-700 rounded-lg sm:rounded-xl p-1">
      <button
        onClick={() => onVistaChange('grid')}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all min-h-[44px] ${
          vista === 'grid'
            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md font-semibold'
            : 'text-white sm:text-gray-600 dark:sm:text-gray-300 hover:text-gray-200 sm:hover:text-gray-900'
        }`}
        aria-label="Vista de tarjetas"
      >
        <Grid3x3 size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="text-xs sm:text-sm">Tarjetas</span>
      </button>
      <button
        onClick={() => onVistaChange('lista')}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all min-h-[44px] ${
          vista === 'lista'
            ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-md font-semibold'
            : 'text-white sm:text-gray-600 dark:sm:text-gray-300 hover:text-gray-200 sm:hover:text-gray-900'
        }`}
        aria-label="Vista de lista"
      >
        <List size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="text-xs sm:text-sm">Lista</span>
      </button>
    </div>
  );
}
