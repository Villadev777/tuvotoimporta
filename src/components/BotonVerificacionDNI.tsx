import { Shield, Check } from 'lucide-react';

interface Props {
  onClick: () => void;
  esVerificado: boolean;
  disabled?: boolean;
}

export function BotonVerificacionDNI({ onClick, esVerificado, disabled }: Props) {
  if (esVerificado) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border-2 border-green-300 dark:border-green-700">
        <Check size={20} />
        <span className="font-semibold text-sm">Identidad Verificada</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      aria-label="Verificar identidad con DNI"
    >
      <Shield size={20} />
      <span className="text-sm">Verificar con DNI</span>
    </button>
  );
}
