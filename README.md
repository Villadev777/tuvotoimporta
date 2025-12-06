# LUKIA Encuestas 2026

Portal de encuestas presidenciales en tiempo real para las Elecciones Generales de Perú - 12 de Abril de 2026.

## Características Principales

### Sistema de Semáforo Judicial Dual
El sistema evalúa tanto al candidato como al partido político, proporcionando una visión completa del riesgo legal.

- **🟢 Verde**: Sin investigaciones penales activas
- **🟡 Amarillo**: Investigaciones en fase fiscal o administrativa
- **🔴 Rojo**: Investigaciones penales graves o condenas vigentes

### Funcionalidades
- Votación en tiempo real con actualización instantánea
- Dashboard con resultados en vivo y gráficos
- Información detallada de cada candidato
- Sistema anti-bot básico con fingerprinting
- Prevención de votos duplicados por dispositivo
- Diseño responsive para móvil y desktop

## Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Iconos**: Lucide React
- **Build**: Vite

## Arquitectura de Base de Datos

### Tablas Principales
1. `partidos_politicos` - Partidos y alianzas electorales
2. `candidatos` - Candidatos presidenciales con semáforo
3. `investigaciones_judiciales` - Investigaciones de cada candidato
4. `encuesta_votos` - Registro de votos con protección anti-bot
5. `audit_log_eventos` - Log de auditoría
6. `rate_limit_control` - Control de límites de votación

### Seguridad
- Row Level Security (RLS) habilitado en todas las tablas
- Políticas restrictivas por defecto
- Validación de votos con fingerprinting
- Triggers automáticos para conteo de votos

## Candidatos Incluidos

### Alianzas Electorales (5)
- Unidad Nacional - Roberto Chiabra León
- Ahora Nación - Alfonso López Chau
- Fuerza y Libertad - Fiorella Molinelli
- Venceremos - Ronald Atencio
- Frente Trabajadores - Napoleón Becerra

### Partidos Principales (15+)
- Fuerza Popular - Keiko Fujimori
- Renovación Popular - Rafael López Aliaga
- APP - César Acuña
- Avanza País - Candidato en definición (Phillip Butters renunció el 05/12/2025)
- Progresemos - Hernando de Soto
- Acción Popular - En primarias internas (6 precandidatos)
- Somos Perú - George Forsyth
- Podemos Perú - Daniel Urresti
- Y más...

## Cómo Usar

### Desarrollo
```bash
npm install
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

## Sistema Anti-Bot

### Capa 1: Fingerprinting de Dispositivo
- Generación de hash único por navegador
- Identificación de dispositivo
- Prevención de votos múltiples

### Capa 2: Validación de Usuario
- Un voto por hash de usuario
- Registro de metadata del voto
- Sistema de flags para votos sospechosos

### Capa 3: Rate Limiting (Preparado para implementación futura)
- Control de intentos por IP
- Bloqueo temporal por comportamiento anómalo
- Sistema de ventanas deslizantes

## Próximas Mejoras

1. Integración con reCAPTCHA v3
2. Sistema de verificación por SMS/Email
3. Integración con API de RENIEC
4. Dashboard de administración
5. Exportación de datos y reportes
6. Gráficos avanzados con tendencias
7. Sistema de notificaciones en tiempo real
8. Modo oscuro

## Fuentes de Datos

- **JNE** (Jurado Nacional de Elecciones): Candidatos y plataformas
- **Poder Judicial**: Investigaciones y antecedentes
- **Fiscalía de la Nación**: Procesos penales activos

## Nota Legal

Esta es una encuesta de opinión sin fuerza vinculante electoral. Los datos presentados son verificados mediante fuentes oficiales del Estado Peruano.

---

**Desarrollado para las Elecciones Presidenciales Perú 2026**
