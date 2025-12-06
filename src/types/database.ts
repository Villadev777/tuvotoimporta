export type SemaforoEstado = 'VERDE' | 'AMARILLO' | 'ROJO';

export type TipoInvestigacion = 'PENAL' | 'ADMINISTRATIVA' | 'CIVIL';

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
  created_at: string;
}

export interface CandidatoConPartido extends Candidato {
  partido: PartidoPolitico | null;
  investigaciones: InvestigacionJudicial[];
}

export interface InvestigacionJudicial {
  id: string;
  candidato_id: string;
  tipo: TipoInvestigacion;
  descripcion: string;
  organismo_investigador: string;
  numero_expediente: string;
  estado: EstadoInvestigacion;
  severidad: number;
  url_verificacion: string;
  fecha_inicio: string | null;
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
