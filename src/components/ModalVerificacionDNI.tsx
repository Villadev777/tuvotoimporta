import { useState } from 'react';
import { Shield, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ModalVerificacionDNIProps {
  onClose: () => void;
  onVerified: (dniHash: string) => void;
}

export function ModalVerificacionDNI({ onClose, onVerified }: ModalVerificacionDNIProps) {
  const [paso, setPaso] = useState<'datos' | 'codigo'>('datos');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [codigoDemo, setCodigoDemo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function solicitarCodigo() {
    if (dni.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return;
    }

    try {
      setCargando(true);
      setError('');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/solicitar-verificacion-dni`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni,
          email: email || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al solicitar código');
      }

      setCodigoDemo(data.codigo_demo);
      setPaso('codigo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar código');
    } finally {
      setCargando(false);
    }
  }

  async function verificarCodigo() {
    if (!codigo) {
      setError('Ingresa el código de verificación');
      return;
    }

    try {
      setCargando(true);
      setError('');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verificar-codigo-dni`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni,
          codigo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar código');
      }

      onVerified(data.dni_hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar código');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <h2 className="text-xl font-bold">Verificación DNI</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-white text-opacity-90 mt-2">
            Verifica tu identidad para mayor confianza en tu voto
          </p>
        </div>

        <div className="p-6">
          {paso === 'datos' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DNI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="12345678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Opcional: recibirás el código por email
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={solicitarCodigo}
                disabled={cargando || dni.length !== 8}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? 'Procesando...' : 'Solicitar Código'}
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Tu DNI será hasheado para proteger tu privacidad.
                  Solo podrás votar una vez con este DNI verificado.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-800 font-medium">
                      Código generado exitosamente
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      En un sistema real, este código se enviaría por SMS o email.
                      Para esta demo, el código es: <strong className="font-mono">{codigoDemo}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-wider"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={verificarCodigo}
                disabled={cargando || codigo.length !== 6}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargando ? 'Verificando...' : 'Verificar Código'}
              </button>

              <button
                onClick={() => setPaso('datos')}
                disabled={cargando}
                className="w-full text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Volver
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
