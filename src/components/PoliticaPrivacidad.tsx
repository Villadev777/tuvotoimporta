import { X, Shield, Lock, Eye, FileText } from 'lucide-react';

interface Props {
  onCerrar: () => void;
}

export function PoliticaPrivacidad({ onCerrar }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onCerrar}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white p-6 rounded-t-2xl border-b-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Shield size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Política de Privacidad</h2>
                <p className="text-blue-100 text-sm mt-1">Protegemos tu información</p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 text-gray-700 dark:text-gray-300 max-h-[70vh] overflow-y-auto">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="text-blue-600 dark:text-blue-400" size={20} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Recopilación de Datos
              </h3>
            </div>
            <p className="leading-relaxed">
              TUVOTOIMPORTA recopila datos mínimos para garantizar la integridad de la encuesta:
              identificadores únicos de dispositivo (fingerprinting), dirección IP y marca de tiempo.
              No recopilamos información personal identificable como nombres, correos electrónicos o
              números de teléfono.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="text-blue-600 dark:text-blue-400" size={20} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Uso de la Información
              </h3>
            </div>
            <p className="leading-relaxed mb-2">
              Los datos recopilados se utilizan exclusivamente para:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Prevenir votos duplicados</li>
              <li>Detectar patrones de fraude electoral</li>
              <li>Generar estadísticas agregadas anónimas</li>
              <li>Mejorar la seguridad de la plataforma</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-blue-600 dark:text-blue-400" size={20} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Protección de Datos
              </h3>
            </div>
            <p className="leading-relaxed">
              Implementamos medidas de seguridad robustas incluyendo cifrado de datos, hashing de
              identificadores, limitación de intentos y monitoreo continuo de patrones sospechosos.
              Los datos se almacenan de forma segura en servidores protegidos y se mantienen solo el
              tiempo necesario para los propósitos declarados.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-blue-600 dark:text-blue-400" size={20} />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Tus Derechos
              </h3>
            </div>
            <p className="leading-relaxed">
              Tienes derecho a conocer qué datos almacenamos sobre tu dispositivo y solicitar su
              eliminación. Esta encuesta es completamente voluntaria y anónima. El voto registrado no
              puede vincularse a tu identidad personal.
            </p>
          </section>

          <section className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm leading-relaxed">
              <strong className="text-gray-900 dark:text-white">Importante:</strong> Esta es una
              encuesta de opinión sin fuerza vinculante electoral. No reemplaza el proceso electoral
              oficial y los resultados son meramente informativos. Los datos de candidatos se verifican
              con fuentes oficiales como JNE, Poder Judicial y Fiscalía de la Nación.
            </p>
          </section>

          <section className="text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
            <p>Última actualización: Diciembre 2025</p>
            <p className="mt-2">
              Para consultas sobre privacidad, contacta a nuestro equipo de protección de datos.
            </p>
          </section>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-2xl border-t dark:border-gray-700">
          <button
            onClick={onCerrar}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
