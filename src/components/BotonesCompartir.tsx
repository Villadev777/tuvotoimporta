import { Share2, Facebook, Twitter, Link2, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface BotonesCompartirProps {
  texto?: string;
}

export function BotonesCompartir({ texto = 'Participa en la encuesta presidencial y conoce el estado judicial de cada candidato' }: BotonesCompartirProps) {
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const url = window.location.href;

  const compartirEnFacebook = () => {
    const urlFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(urlFacebook, '_blank', 'width=600,height=400');
  };

  const compartirEnTwitter = () => {
    const urlTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}`;
    window.open(urlTwitter, '_blank', 'width=600,height=400');
  };

  const compartirEnWhatsApp = () => {
    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(texto + ' ' + url)}`;
    window.open(urlWhatsApp, '_blank');
  };

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setMostrarOpciones(!mostrarOpciones)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-xs sm:text-base min-h-[44px]"
        aria-label="Compartir"
      >
        <Share2 size={16} className="sm:w-[18px] sm:h-[18px]" />
        <span className="hidden sm:inline">Compartir</span>
      </button>

      {mostrarOpciones && (
        <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => {
              compartirEnFacebook();
              setMostrarOpciones(false);
            }}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left min-h-[44px]"
          >
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Facebook size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Facebook</span>
          </button>

          <button
            onClick={() => {
              compartirEnTwitter();
              setMostrarOpciones(false);
            }}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left border-t border-gray-100 dark:border-gray-700 min-h-[44px]"
          >
            <div className="bg-sky-500 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Twitter size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Twitter</span>
          </button>

          <button
            onClick={() => {
              compartirEnWhatsApp();
              setMostrarOpciones(false);
            }}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left border-t border-gray-100 dark:border-gray-700 min-h-[44px]"
          >
            <div className="bg-green-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <MessageCircle size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">WhatsApp</span>
          </button>

          <button
            onClick={copiarEnlace}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-100 dark:border-gray-700 min-h-[44px]"
          >
            <div className="bg-gray-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Link2 size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
              {copiado ? '¡Copiado!' : 'Copiar enlace'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
