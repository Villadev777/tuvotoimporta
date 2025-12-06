export type SemaforoEstado = 'VERDE' | 'AMARILLO' | 'ROJO';

export type TipoCandidato = 'PRECANDIDATO_OFICIAL' | 'REFERENCIA_HISTORICA' | 'FUERA_DE_CARRERA' | 'EN_DEFINICION';

export type TipoInvestigacion = 'PENAL' | 'ADMINISTRATIVA' | 'CIVIL' | 'PRELIMINAR' | 'COLECTIVA';

export type EstadoInvestigacion = 'EN_INVESTIGACION' | 'EN_PROCESO' | 'SENTENCIADO' | 'ARCHIVADO';

export type ResultadoValidacion = 'APROBADO' | 'RECHAZADO' | 'REVISION' | 'PENDIENTE';

export type MetodoVerificacion = 'EMAIL_SMS' | 'RENIEC' | 'NINGUNO';

export interface PartidoPolitico {
  id: string;
  nombre: string;
  sigla: string;
  descripcion: string;
  ideologia: string;
  url_oficial: string;
  url_plataforma_electoral: string;
  es_alianza: boolean;
  estado_semaforo_partidario: SemaforoEstado;
  tiene_investigacion_colectiva: boolean;
  tipo_investigacion_partidaria: string | null;
  riesgo_reputacional_historico: string | null;
  created_at: string;
}

export interface Candidato {
  id: string;
  nombre_completo: string;
  dni: string | null;
  partido_id: string | null;
  estado_semaforo: SemaforoEstado;
  plan_gobierno: string;
  propuestas_clave: string[];
  url_foto: string;
  url_plataforma_jne: string;
  biografia_breve: string;
  fecha_actualizacion_estado_legal: string;
  total_votos: number;
  activo: boolean;
  tiene_investigaciones_familiares: boolean;
  riesgo_reputacional_descripcion: string | null;
  tipo_candidato: TipoCandidato;
  inscrito_onpe: boolean;
  notas_clasificacion: string | null;
  created_at: string;
}

export interface PartidoConInvestigaciones extends PartidoPolitico {
  investigaciones_partidarias: PartidoInvestigacion[];
}

export interface CandidatoConPartido extends Candidato {
  partido: PartidoConInvestigaciones | null;
  investigaciones: InvestigacionJudicial[];
}

export interface InvestigacionJudicial {
  id: string;
  candidato_id: string | null;
  partido_id: string | null;
  tipo: TipoInvestigacion;
  descripcion: string;
  organismo_investigador: string;
  numero_expediente: string;
  estado: EstadoInvestigacion;
  severidad: number;
  url_verificacion: string;
  fecha_inicio: string | null;
  alcance: string | null;
  liderazgo_afectado: string | null;
  afecta_candidatura: boolean;
  created_at: string;
}

export interface PartidoInvestigacion {
  id: string;
  partido_id: string;
  tipo_investigacion: string;
  descripcion_detallada: string;
  organizacion_investigadora: string;
  fecha_inicio: string | null;
  fecha_actualizacion: string;
  estado_actual: string;
  nivel_severidad: number;
  url_verificacion: string | null;
  candidatos_historicos_investigados: Record<string, unknown>[] | null;
  created_at: string;
}

export interface EncuestaVoto {
  id: string;
  candidato_id: string;
  usuario_hash: string;
  dispositivo_fingerprint: string;
  ip_address: string;
  recaptcha_score: number;
  resultado_validacion: ResultadoValidacion;
  metodo_verificacion: MetodoVerificacion;
  es_sospechoso: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ResultadoEncuesta {
  candidato_id: string;
  nombre_completo: string;
  partido_nombre: string | null;
  estado_semaforo: SemaforoEstado;
  total_votos: number;
  porcentaje: number;
}

export interface Database {
  public: {
    Tables: {
      partidos_politicos: {
        Row: PartidoPolitico;
        Insert: Omit<PartidoPolitico, 'id' | 'created_at'>;
        Update: Partial<Omit<PartidoPolitico, 'id' | 'created_at'>>;
      };
      candidatos: {
        Row: Candidato;
        Insert: Omit<Candidato, 'id' | 'created_at' | 'total_votos'>;
        Update: Partial<Omit<Candidato, 'id' | 'created_at'>>;
      };
      investigaciones_judiciales: {
        Row: InvestigacionJudicial;
        Insert: Omit<InvestigacionJudicial, 'id' | 'created_at'>;
        Update: Partial<Omit<InvestigacionJudicial, 'id' | 'created_at'>>;
      };
      encuesta_votos: {
        Row: EncuestaVoto;
        Insert: Omit<EncuestaVoto, 'id' | 'created_at'>;
        Update: Partial<Omit<EncuestaVoto, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      obtener_resultados_encuesta: {
        Args: Record<string, never>;
        Returns: ResultadoEncuesta[];
      };
    };
  };
}
