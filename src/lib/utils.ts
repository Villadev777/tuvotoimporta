import type { SemaforoEstado } from '../types/database';

export function generarHashUsuario(): string {
  const navegador = navigator.userAgent;
  const idioma = navigator.language;
  const zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const pantalla = `${window.screen.width}x${window.screen.height}`;

  const cadena = `${navegador}-${idioma}-${zonaHoraria}-${pantalla}`;
  return hashSimple(cadena);
}

export function generarFingerprintDispositivo(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${timestamp}-${random}`;
}

function hashSimple(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function obtenerColorSemaforo(estado: SemaforoEstado): string {
  switch (estado) {
    case 'VERDE':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'AMARILLO':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'ROJO':
      return 'text-red-600 bg-red-50 border-red-200';
  }
}

export function obtenerTextoSemaforo(estado: SemaforoEstado): string {
  switch (estado) {
    case 'VERDE':
      return 'Sin investigaciones penales activas';
    case 'AMARILLO':
      return 'Investigaciones en proceso';
    case 'ROJO':
      return 'Investigaciones graves o condenas vigentes';
  }
}

export function obtenerIconoSemaforo(estado: SemaforoEstado): string {
  switch (estado) {
    case 'VERDE':
      return '🟢';
    case 'AMARILLO':
      return '🟡';
    case 'ROJO':
      return '🔴';
  }
}

export function formatearPorcentaje(numero: number): string {
  return numero.toFixed(2);
}

export function formatearNumero(numero: number): string {
  return new Intl.NumberFormat('es-PE').format(numero);
}

export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
