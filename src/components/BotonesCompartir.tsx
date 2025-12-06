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
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
      >
        <Share2 size={18} />
        Compartir
      </button>

      {mostrarOpciones && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => {
              compartirEnFacebook();
              setMostrarOpciones(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Facebook size={18} className="text-white" />
            </div>
            <span className="font-medium text-gray-900">Facebook</span>
          </button>

          <button
            onClick={() => {
              compartirEnTwitter();
              setMostrarOpciones(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-t border-gray-100"
          >
            <div className="bg-sky-500 p-2 rounded-lg">
              <Twitter size={18} className="text-white" />
            </div>
            <span className="font-medium text-gray-900">Twitter</span>
          </button>

          <button
            onClick={() => {
              compartirEnWhatsApp();
              setMostrarOpciones(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left border-t border-gray-100"
          >
            <div className="bg-green-600 p-2 rounded-lg">
              <MessageCircle size={18} className="text-white" />
            </div>
            <span className="font-medium text-gray-900">WhatsApp</span>
          </button>

          <button
            onClick={copiarEnlace}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
          >
            <div className="bg-gray-600 p-2 rounded-lg">
              <Link2 size={18} className="text-white" />
            </div>
            <span className="font-medium text-gray-900">
              {copiado ? '¡Copiado!' : 'Copiar enlace'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
