import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Vote, Search, Filter, Info } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: typeof Vote;
}

const steps: TutorialStep[] = [
  {
    title: 'Bienvenido a TUVOTOIMPORTA',
    description: 'Esta plataforma te permite conocer a los candidatos presidenciales y emitir tu voto en nuestra encuesta informativa.',
    icon: Vote,
  },
  {
    title: 'Sistema de Semáforo',
    description: 'Cada candidato tiene un indicador de color basado en su situación judicial: Verde (sin investigaciones), Amarillo (investigaciones en proceso), Rojo (investigaciones graves o condenas).',
    icon: Info,
  },
  {
    title: 'Busca y Filtra',
    description: 'Usa la barra de búsqueda y los filtros para encontrar candidatos por nombre, partido político o estado judicial.',
    icon: Search,
  },
  {
    title: 'Compara Candidatos',
    description: 'Puedes agregar hasta 3 candidatos a la comparación para ver sus perfiles lado a lado.',
    icon: Filter,
  },
  {
    title: 'Emite tu Voto',
    description: 'Haz clic en un candidato para emitir tu voto. Solo puedes votar una vez, así que elige con cuidado.',
    icon: Vote,
  },
];

export function Tutorial() {
  const [mostrar, setMostrar] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);

  useEffect(() => {
    const tutorialVisto = localStorage.getItem('tutorial_visto');
    if (!tutorialVisto) {
      setMostrar(true);
    }
  }, []);

  const cerrar = () => {
    localStorage.setItem('tutorial_visto', 'true');
    setMostrar(false);
  };

  const siguiente = () => {
    if (pasoActual < steps.length - 1) {
      setPasoActual(pasoActual + 1);
    } else {
      cerrar();
    }
  };

  const anterior = () => {
    if (pasoActual > 0) {
      setPasoActual(pasoActual - 1);
    }
  };

  if (!mostrar) {
    return null;
  }

  const paso = steps[pasoActual];
  const Icon = paso.icon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl">
              <Icon size={28} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {paso.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Paso {pasoActual + 1} de {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={cerrar}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Cerrar tutorial"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">
          {paso.description}
        </p>

        <div className="flex gap-1 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                index === pasoActual
                  ? 'bg-blue-600 dark:bg-blue-500'
                  : index < pasoActual
                  ? 'bg-blue-300 dark:bg-blue-700'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {pasoActual > 0 && (
            <button
              onClick={anterior}
              className="flex items-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all"
            >
              <ChevronLeft size={20} />
              Anterior
            </button>
          )}
          <button
            onClick={siguiente}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            {pasoActual === steps.length - 1 ? '¡Comenzar!' : 'Siguiente'}
            {pasoActual < steps.length - 1 && <ChevronRight size={20} />}
          </button>
        </div>

        <button
          onClick={cerrar}
          className="w-full mt-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Saltar tutorial
        </button>
      </div>
    </div>
  );
}
