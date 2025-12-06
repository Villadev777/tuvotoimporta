import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { SemaforoEstado } from '../types/database';
import { obtenerColorSemaforo, obtenerTextoSemaforo } from '../lib/utils';
import { Tooltip } from './Tooltip';

interface SemaforoIndicadorProps {
  estado: SemaforoEstado;
  tamaño?: 'pequeño' | 'mediano' | 'grande';
  mostrarTooltip?: boolean;
}

export function SemaforoIndicador({ estado, tamaño = 'mediano', mostrarTooltip = true }: SemaforoIndicadorProps) {
  const colorClases = obtenerColorSemaforo(estado);
  const texto = obtenerTextoSemaforo(estado);

  const tamañoClases = {
    pequeño: 'text-sm px-2 py-1',
    mediano: 'text-base px-3 py-1.5',
    grande: 'text-lg px-4 py-2',
  };

  const iconoTamaño = {
    pequeño: 16,
    mediano: 20,
    grande: 24,
  };

  const tooltipContent = {
    VERDE: 'Sin investigaciones penales activas - Datos verificados vía Poder Judicial',
    AMARILLO: 'Investigaciones en proceso fiscal o preliminares - Requiere seguimiento',
    ROJO: 'Investigaciones graves, sentencias o condenas vigentes - Alto riesgo',
  };

  const Icono = estado === 'VERDE' ? CheckCircle : estado === 'AMARILLO' ? AlertCircle : XCircle;

  const contenido = (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border font-medium ${colorClases} ${tamañoClases[tamaño]}`}
    >
      <Icono size={iconoTamaño[tamaño]} />
      <span>{texto}</span>
    </div>
  );

  if (!mostrarTooltip) {
    return contenido;
  }

  return (
    <Tooltip content={tooltipContent[estado]} posicion="top">
      {contenido}
    </Tooltip>
  );
}
