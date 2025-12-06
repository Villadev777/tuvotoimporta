import { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, Shield, Info, X, Vote, GitCompare, Moon, Sun, FileText } from 'lucide-react';
import type { CandidatoConPartido, ResultadoEncuesta, SemaforoEstado, TipoCandidato } from './types/database';
import {
  obtenerCandidatos,
  obtenerResultadosEncuesta,
  registrarVoto,
  verificarVotoPrevio,
  suscribirACambiosVotos,
} from './lib/api';
import { loadRecaptchaScript } from './lib/recaptcha';
import { useTheme } from './contexts/ThemeContext';
import { TarjetaCandidato } from './components/TarjetaCandidato';
import { TarjetaCandidatoLista } from './components/TarjetaCandidatoLista';
import { ModalDetallesCandidato } from './components/ModalDetallesCandidato';
import { ResultadosEncuesta } from './components/ResultadosEncuesta';
import { BarraBusquedaFiltros } from './components/BarraBusquedaFiltros';
import { SelectorOrdenamiento, type TipoOrdenamiento } from './components/SelectorOrdenamiento';
import { ToggleVista, type TipoVista } from './components/ToggleVista';
import { SkeletonCandidato } from './components/SkeletonCandidato';
import { BotonesCompartir } from './components/BotonesCompartir';
import { ComparadorCandidatos } from './components/ComparadorCandidatos';
import { Tutorial } from './components/Tutorial';
import { PoliticaPrivacidad } from './components/PoliticaPrivacidad';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [candidatos, setCandidatos] = useState<CandidatoConPartido[]>([]);
  const [resultados, setResultados] = useState<ResultadoEncuesta[]>([]);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<CandidatoConPartido | null>(
    null
  );
  const [candidatoParaVotar, setCandidatoParaVotar] = useState<CandidatoConPartido | null>(null);
  const [haVotado, setHaVotado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [votando, setVotando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [mostrarPrivacidad, setMostrarPrivacidad] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroSemaforo, setFiltroSemaforo] = useState<SemaforoEstado | 'TODOS'>('TODOS');
  const [filtroPartido, setFiltroPartido] = useState('TODOS');
  const [filtroTipoCandidato, setFiltroTipoCandidato] = useState<TipoCandidato | 'TODOS'>('TODOS');
  const [ordenamiento, setOrdenamiento] = useState<TipoOrdenamiento>('votos-desc');
  const [vista, setVista] = useState<TipoVista>('grid');
  const [candidatosParaComparar, setCandidatosParaComparar] = useState<CandidatoConPartido[]>([]);
  const [mostrarComparador, setMostrarComparador] = useState(false);

  useEffect(() => {
    cargarDatos();
    verificarEstadoVoto();
    loadRecaptchaScript().catch((err) => {
      console.error('Error loading reCAPTCHA:', err);
    });

    const unsubscribe = suscribirACambiosVotos(() => {
      cargarResultados();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  async function cargarDatos() {
    try {
      setCargando(true);
      const [dataCandidatos, dataResultados] = await Promise.all([
        obtenerCandidatos(),
        obtenerResultadosEncuesta(),
      ]);
      setCandidatos(dataCandidatos);
      setResultados(dataResultados);
    } catch (err) {
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  }

  async function cargarResultados() {
    try {
      const dataResultados = await obtenerResultadosEncuesta();
      setResultados(dataResultados);
    } catch (err) {
      console.error('Error al actualizar resultados:', err);
    }
  }

  async function verificarEstadoVoto() {
    try {
      const yaVoto = await verificarVotoPrevio();
      setHaVotado(yaVoto);
    } catch (err) {
      console.error('Error al verificar voto:', err);
    }
  }

  function iniciarVoto(candidato: CandidatoConPartido) {
    if (haVotado) {
      return;
    }
    setCandidatoParaVotar(candidato);
  }

  function agregarParaComparar(candidato: CandidatoConPartido) {
    if (candidatosParaComparar.length >= 3) {
      return;
    }
    if (!candidatosParaComparar.find((c) => c.id === candidato.id)) {
      setCandidatosParaComparar([...candidatosParaComparar, candidato]);
    }
  }

  function removerDeComparacion(candidatoId: string) {
    setCandidatosParaComparar(candidatosParaComparar.filter((c) => c.id !== candidatoId));
  }

  const partidosDisponibles = useMemo(() => {
    const partidos = candidatos
      .filter((c) => c.partido)
      .map((c) => c.partido!)
      .filter((partido, index, self) => self.findIndex((p) => p.id === partido.id) === index);
    return partidos;
  }, [candidatos]);

  const candidatosFiltrados = useMemo(() => {
    let filtrados = [...candidatos];

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      filtrados = filtrados.filter((c) =>
        c.nombre_completo.toLowerCase().includes(busquedaLower)
      );
    }

    if (filtroSemaforo !== 'TODOS') {
      filtrados = filtrados.filter((c) => c.estado_semaforo === filtroSemaforo);
    }

    if (filtroPartido !== 'TODOS') {
      filtrados = filtrados.filter((c) => c.partido_id === filtroPartido);
    }

    if (filtroTipoCandidato !== 'TODOS') {
      filtrados = filtrados.filter((c) => c.tipo_candidato === filtroTipoCandidato);
    }

    return filtrados;
  }, [candidatos, busqueda, filtroSemaforo, filtroPartido, filtroTipoCandidato]);

  const candidatosOrdenados = useMemo(() => {
    const ordenados = [...candidatosFiltrados];

    switch (ordenamiento) {
      case 'nombre-asc':
        ordenados.sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
        break;
      case 'nombre-desc':
        ordenados.sort((a, b) => b.nombre_completo.localeCompare(a.nombre_completo));
        break;
      case 'votos-asc':
        ordenados.sort((a, b) => a.total_votos - b.total_votos);
        break;
      case 'votos-desc':
        ordenados.sort((a, b) => b.total_votos - a.total_votos);
        break;
      case 'semaforo-critico':
        const orden = { ROJO: 0, AMARILLO: 1, VERDE: 2 };
        ordenados.sort((a, b) => orden[a.estado_semaforo] - orden[b.estado_semaforo]);
        break;
      case 'partido':
        ordenados.sort((a, b) => {
          const partidoA = a.partido?.nombre || '';
          const partidoB = b.partido?.nombre || '';
          return partidoA.localeCompare(partidoB);
        });
        break;
    }

    return ordenados;
  }, [candidatosFiltrados, ordenamiento]);

  async function confirmarVoto() {
    if (!candidatoParaVotar) return;

    try {
      setVotando(true);

      const resultado = await registrarVoto(candidatoParaVotar.id, false);

      if (resultado.success) {
        setHaVotado(true);
        setCandidatoParaVotar(null);
        setMostrarExito(true);

        setTimeout(() => setMostrarExito(false), 5000);

        await cargarResultados();
      } else {
        alert(resultado.message || 'No se pudo registrar el voto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar el voto';
      alert(errorMessage);
      console.error(err);
    } finally {
      setVotando(false);
    }
  }

  const totalVotos = resultados.reduce((sum, r) => sum + r.total_votos, 0);

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-gray-950 dark:via-blue-950 dark:to-gray-950 text-white shadow-xl sticky top-0 z-40 border-b-4 border-blue-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg">
                  <Vote size={36} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  TU VOTO IMPORTA
                </h1>
                <p className="text-sm md:text-base text-blue-200 font-medium">
                  Elecciones Perú 2026
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCandidato key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-gray-950 dark:via-blue-950 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-600" />
          </div>
          <p className="text-red-600 text-lg mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-semibold"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      <Tutorial />
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-gray-950 dark:via-blue-950 dark:to-gray-950 text-white shadow-xl sticky top-0 z-40 border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-blue-500 rounded-xl sm:rounded-2xl blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                  <Vote size={24} className="text-white sm:w-9 sm:h-9" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  TU VOTO IMPORTA
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-blue-200 font-medium">
                  Elecciones Perú 2026
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <BotonesCompartir />
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-all border border-white/20 hover:scale-105 transform"
                aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
              >
                {theme === 'dark' ? <Sun size={18} className="sm:w-5 sm:h-5" /> : <Moon size={18} className="sm:w-5 sm:h-5" />}
                <span className="hidden md:inline font-medium text-sm">
                  {theme === 'dark' ? 'Claro' : 'Oscuro'}
                </span>
              </button>
              <button
                onClick={() => setMostrarInfo(!mostrarInfo)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-all border border-white/20 hover:scale-105 transform"
                aria-label="Mostrar información"
              >
                <Info size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden md:inline font-medium text-sm">Info</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {mostrarInfo && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b-2 border-blue-500 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 text-white">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl flex-shrink-0">
                <Shield size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 w-full">
                <h3 className="font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
                  Sistema de Semáforo Judicial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-sm">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border border-white/20">
                    <p className="font-semibold mb-1 text-sm">🟢 Verde</p>
                    <p className="text-blue-100 text-xs">Sin investigaciones penales activas</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border border-white/20">
                    <p className="font-semibold mb-1 text-sm">🟡 Amarillo</p>
                    <p className="text-blue-100 text-xs">Investigaciones en proceso fiscal</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border border-white/20">
                    <p className="font-semibold mb-1 text-sm">🔴 Rojo</p>
                    <p className="text-blue-100 text-xs">Investigaciones graves o condenas</p>
                  </div>
                </div>
                <p className="text-xs text-blue-100 mt-3">
                  Encuesta informativa sin fuerza vinculante. Datos verificados vía JNE y Poder Judicial.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarExito && (
        <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-green-400">
            <CheckCircle2 size={24} className="flex-shrink-0" />
            <div>
              <p className="font-bold">¡Voto registrado!</p>
              <p className="text-sm text-green-100">Gracias por participar</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <ResultadosEncuesta resultados={resultados} totalVotos={totalVotos} />

        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-5">
          <div className="flex gap-3">
            <Info size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-300 mb-2">
                Candidatos Oficiales ONPE 2026
              </h3>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed mb-3">
                Esta plataforma muestra únicamente los <strong>precandidatos presidenciales oficiales inscritos ante ONPE</strong> para las Elecciones 2026,
                más aquellos que están <strong>en primarias internas</strong> de sus partidos.
              </p>
              <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-3 mb-3 border border-blue-300 dark:border-blue-700">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1.5">
                  🎯 Categorías de Candidatos:
                </p>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                  <li><strong>• Precandidato Oficial:</strong> Inscrito formalmente ante ONPE</li>
                  <li><strong>• En Definición:</strong> En primarias internas de Acción Popular</li>
                </ul>
              </div>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                <strong>Sistema de semáforo:</strong> Analiza el riesgo legal según el modelo (Legalidad, Uso de recursos,
                Culpabilidad, Integridad, Antecedentes). El semáforo es independiente de la habilitación legal para postular.
              </p>
            </div>
          </div>
        </div>

        <BarraBusquedaFiltros
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtroSemaforo={filtroSemaforo}
          onFiltroSemaforoChange={setFiltroSemaforo}
          filtroPartido={filtroPartido}
          onFiltroPartidoChange={setFiltroPartido}
          filtroTipoCandidato={filtroTipoCandidato}
          onFiltroTipoCandidatoChange={setFiltroTipoCandidato}
          partidosDisponibles={partidosDisponibles}
          totalResultados={candidatosOrdenados.length}
          totalCandidatos={candidatos.length}
        />

        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-blue-500/30">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Todos los Candidatos</h2>
                <p className="text-sm sm:text-base text-blue-200">
                  {haVotado ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-400 sm:w-[18px] sm:h-[18px]" />
                      Ya emitiste tu voto en esta encuesta
                    </span>
                  ) : (
                    'Haz clic en un candidato para emitir tu voto'
                  )}
                </p>
              </div>
              {candidatosParaComparar.length > 0 && (
                <button
                  onClick={() => setMostrarComparador(true)}
                  className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg sm:rounded-xl hover:bg-white/20 transition-all border border-white/20 hover:scale-105 transform font-semibold text-sm sm:text-base"
                >
                  <GitCompare size={18} className="sm:w-5 sm:h-5" />
                  Comparar ({candidatosParaComparar.length})
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            <SelectorOrdenamiento
              ordenamiento={ordenamiento}
              onOrdenamientoChange={setOrdenamiento}
            />
            <ToggleVista vista={vista} onVistaChange={setVista} />
          </div>
        </div>

        {candidatosOrdenados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">
              No se encontraron candidatos con los filtros seleccionados.
            </p>
            <button
              onClick={() => {
                setBusqueda('');
                setFiltroSemaforo('TODOS');
                setFiltroPartido('TODOS');
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
            >
              Limpiar filtros
            </button>
          </div>
        ) : vista === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidatosOrdenados.map((candidato, index) => (
              <div
                key={candidato.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TarjetaCandidato
                  candidato={candidato}
                  onVerDetalles={setCandidatoSeleccionado}
                  onVotar={iniciarVoto}
                  haVotado={haVotado}
                />
                {candidatosParaComparar.length < 3 && (
                  <button
                    onClick={() => agregarParaComparar(candidato)}
                    disabled={candidatosParaComparar.some((c) => c.id === candidato.id)}
                    className={`mt-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      candidatosParaComparar.some((c) => c.id === candidato.id)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {candidatosParaComparar.some((c) => c.id === candidato.id)
                      ? '✓ Para comparar'
                      : '+ Agregar a comparación'}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {candidatosOrdenados.map((candidato, index) => (
              <div
                key={candidato.id}
                className="animate-in fade-in slide-in-from-left duration-300"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TarjetaCandidatoLista
                  candidato={candidato}
                  onVerDetalles={setCandidatoSeleccionado}
                  onVotar={iniciarVoto}
                  haVotado={haVotado}
                />
                {candidatosParaComparar.length < 3 && (
                  <button
                    onClick={() => agregarParaComparar(candidato)}
                    disabled={candidatosParaComparar.some((c) => c.id === candidato.id)}
                    className={`mt-2 ml-20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      candidatosParaComparar.some((c) => c.id === candidato.id)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {candidatosParaComparar.some((c) => c.id === candidato.id)
                      ? '✓ Para comparar'
                      : '+ Agregar a comparación'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {candidatoSeleccionado && (
        <ModalDetallesCandidato
          candidato={candidatoSeleccionado}
          onCerrar={() => setCandidatoSeleccionado(null)}
        />
      )}

      {candidatoParaVotar && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setCandidatoParaVotar(null)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Vote size={32} className="text-blue-600 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Confirmar Voto
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                ¿Confirmas tu voto por{' '}
                <span className="font-bold text-blue-600">
                  {candidatoParaVotar.nombre_completo}
                </span>
                ?
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                ⚠️ Esta acción no se puede deshacer
              </p>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setCandidatoParaVotar(null)}
                  disabled={votando}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-semibold transition-all disabled:opacity-50 text-sm sm:text-base min-h-[44px]"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarVoto}
                  disabled={votando}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg sm:rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg text-sm sm:text-base min-h-[44px]"
                >
                  {votando ? 'Votando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mostrarComparador && (
        <ComparadorCandidatos
          candidatos={candidatosParaComparar}
          onCerrar={() => setMostrarComparador(false)}
          onRemoverCandidato={removerDeComparacion}
        />
      )}

      {mostrarPrivacidad && (
        <PoliticaPrivacidad onCerrar={() => setMostrarPrivacidad(false)} />
      )}

      <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-gray-950 dark:via-blue-950 dark:to-gray-950 text-white border-t-4 border-blue-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              TU VOTO IMPORTA
            </h3>
            <p className="text-blue-200 mb-4">Portal de Encuestas Presidenciales</p>
            <p className="text-sm text-blue-300 mb-2">
              Datos verificados: JNE, Poder Judicial y Fiscalía de la Nación
            </p>
            <p className="text-xs text-blue-400 mb-4">
              Encuesta de opinión sin fuerza vinculante electoral
            </p>
            <button
              onClick={() => setMostrarPrivacidad(true)}
              className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-100 transition-colors underline"
              aria-label="Ver política de privacidad"
            >
              <FileText size={16} />
              Política de Privacidad
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
