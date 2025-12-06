import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  remainingAttempts: number;
  maxAttempts: number;
  resetTime?: Date;
}

export function RateLimitIndicator({ remainingAttempts, maxAttempts, resetTime }: Props) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!resetTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const reset = resetTime.getTime();
      const diff = reset - now;

      if (diff <= 0) {
        setTimeRemaining('');
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [resetTime]);

  const percentage = (remainingAttempts / maxAttempts) * 100;
  const isLow = percentage < 30;
  const isCritical = percentage < 10;

  if (remainingAttempts === maxAttempts) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-300 ${
        isCritical
          ? 'bg-gradient-to-r from-red-500 to-red-600'
          : isLow
          ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
          : 'bg-gradient-to-r from-blue-500 to-blue-600'
      } text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm border-2 ${
        isCritical
          ? 'border-red-400'
          : isLow
          ? 'border-yellow-400'
          : 'border-blue-400'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold mb-1">
            {isCritical
              ? 'Límite casi alcanzado'
              : isLow
              ? 'Atención: Pocos intentos restantes'
              : 'Monitoreo de seguridad'}
          </p>
          <p className="text-sm text-white/90 mb-2">
            Intentos restantes: <strong>{remainingAttempts}</strong> de {maxAttempts}
          </p>
          {timeRemaining && (
            <p className="text-xs text-white/80">
              Se reinicia en: <strong>{timeRemaining}</strong>
            </p>
          )}
          <div className="mt-2 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
