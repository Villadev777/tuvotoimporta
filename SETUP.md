# Guía de Configuración - Sistema Anti-Fraude

## Configuración Inicial

### 1. Configurar reCAPTCHA v3

El sistema usa reCAPTCHA v3 de Google para detectar bots. Sigue estos pasos:

#### Paso 1: Registrar tu sitio
1. Ve a [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/create)
2. Haz clic en "Create" o "+"
3. Completa el formulario:
   - **Label:** TUVOTOIMPORTA
   - **reCAPTCHA type:** Selecciona "reCAPTCHA v3"
   - **Domains:** Agrega tu dominio (ejemplo: `tuvotoimporta.com`)
     - Para desarrollo local: `localhost`
   - **Accept terms** y haz clic en "Submit"

#### Paso 2: Obtener las keys
Después de crear el sitio, verás dos keys:
- **Site Key:** Clave pública (va en el frontend)
- **Secret Key:** Clave privada (va en el backend)

#### Paso 3: Configurar en tu proyecto

**Frontend (.env file):**
```bash
VITE_RECAPTCHA_SITE_KEY=tu_site_key_aqui
```

**Backend (Supabase):**

La Secret Key ya está configurada automáticamente en Supabase Edge Functions como variable de entorno `RECAPTCHA_SECRET_KEY`.

Si necesitas actualizarla manualmente:
1. Ve a Supabase Dashboard
2. Project Settings → Edge Functions → Secrets
3. Agrega: `RECAPTCHA_SECRET_KEY=tu_secret_key_aqui`

### 2. Verificar Base de Datos

Las migraciones ya fueron aplicadas automáticamente. Verifica que existan las siguientes tablas:

```sql
-- Tablas de seguridad
- sesiones_voto
- ips_bloqueadas
- patrones_sospechosos
- usuarios_verificados
- votos_pendientes
- audit_logs

-- Vistas
- estadisticas_seguridad
- votos_sospechosos_resumen

-- Funciones
- calcular_trust_score()
- validar_y_registrar_voto()
- detectar_patrones_sospechosos()
```

Para verificar en Supabase:
1. Ve a SQL Editor
2. Ejecuta: `SELECT * FROM sesiones_voto LIMIT 1;`
3. Debe retornar datos o estar vacía (no error)

### 3. Verificar Edge Functions

Tres Edge Functions deben estar desplegadas:

```bash
# Verificar en Supabase Dashboard → Edge Functions
1. procesar-voto
2. detectar-patrones
3. solicitar-verificacion-dni
4. verificar-codigo-dni
```

**URLs de las funciones:**
```
https://[tu-proyecto].supabase.co/functions/v1/procesar-voto
https://[tu-proyecto].supabase.co/functions/v1/detectar-patrones
https://[tu-proyecto].supabase.co/functions/v1/solicitar-verificacion-dni
https://[tu-proyecto].supabase.co/functions/v1/verificar-codigo-dni
```

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

El sistema debería estar funcionando en `http://localhost:5173`

### 6. Probar el Sistema

#### Test 1: Voto normal
1. Abre la aplicación
2. Selecciona un candidato
3. Confirma el voto
4. Debería registrarse exitosamente

#### Test 2: Intento de doble voto
1. Intenta votar nuevamente
2. Debería mostrar error: "Ya has votado con este dispositivo"

#### Test 3: Verificación DNI
1. Haz clic en "Verificar con DNI" (si agregaste el componente)
2. Ingresa un DNI de 8 dígitos (ejemplo: 12345678)
3. Opcionalmente, ingresa un email
4. Solicita código
5. Verás el código en pantalla (en producción se enviaría por SMS)
6. Ingresa el código
7. Debería verificarse exitosamente

#### Test 4: Dashboard Admin
1. Importa y renderiza el componente `DashboardAdmin`
2. Deberías ver estadísticas de seguridad
3. Votos pendientes de revisión
4. Patrones sospechosos detectados

## Configuración Avanzada

### Ajustar Umbrales de Seguridad

Edita la migración o función `calcular_trust_score()` para ajustar:

```sql
-- Cambiar puntos de reCAPTCHA (actualmente 0-40)
v_score := v_score + (COALESCE(p_recaptcha_score, 0.5) * 40);

-- Cambiar bonus de verificación DNI (actualmente +30)
IF p_es_verificado THEN
  v_score := v_score + 30;
END IF;

-- Cambiar penalización por intentos (actualmente -10/-20)
IF v_intentos_recientes > 3 THEN
  v_score := v_score - 20;
ELSIF v_intentos_recientes > 1 THEN
  v_score := v_score - 10;
END IF;
```

### Configurar Rate Limiting

Edita `validar_y_registrar_voto()` para ajustar límites:

```sql
-- Cambiar límite de intentos por hora (actualmente 3)
SELECT COUNT(*) INTO v_intentos_recientes
FROM sesiones_voto
WHERE ip_hash = p_ip_hash
  AND intento_timestamp > now() - interval '1 hour';

IF v_intentos_recientes >= 3 THEN
  -- Cambiar duración de bloqueo (actualmente 1 hora)
  bloqueado_hasta = now() + interval '1 hour'
```

### Programar Detección de Patrones

Para ejecutar automáticamente cada hora, puedes usar:

1. **pg_cron** (requiere extensión):
```sql
SELECT cron.schedule('detectar-patrones-horario', '0 * * * *',
  'SELECT detectar_patrones_sospechosos()');
```

2. **GitHub Actions** o **Cron Job externo**:
```bash
# Llamar a Edge Function cada hora
curl -X POST https://[tu-proyecto].supabase.co/functions/v1/detectar-patrones \
  -H "Authorization: Bearer [tu-anon-key]"
```

## Troubleshooting

### Error: "reCAPTCHA not configured"
- Verifica que `VITE_RECAPTCHA_SITE_KEY` esté en `.env`
- Reinicia el servidor de desarrollo: `npm run dev`

### Error: "IP temporalmente bloqueada"
- Espera 1 hora o limpia la tabla `ips_bloqueadas` en desarrollo:
```sql
DELETE FROM ips_bloqueadas;
```

### Error: "Trust score muy bajo"
- Verifica que reCAPTCHA esté funcionando
- Considera usar verificación DNI para aumentar el score
- Revisa `sesiones_voto` para ver el motivo exacto

### Edge Function no responde
- Ve a Supabase Dashboard → Edge Functions → Logs
- Revisa los errores en la consola
- Verifica que las variables de entorno estén configuradas

### Dashboard Admin no muestra datos
- Verifica que existan votos en `sesiones_voto`
- Revisa las políticas RLS de las vistas
- Asegúrate de que las funciones de PostgreSQL existan

## Producción

### Antes de lanzar:

1. ✅ Configura reCAPTCHA para tu dominio real
2. ✅ Actualiza CORS en Edge Functions si es necesario
3. ✅ Configura alertas en Supabase para monitoreo
4. ✅ Prueba todos los flujos de votación
5. ✅ Configura backups automáticos de la base de datos
6. ✅ Revisa y ajusta umbrales según tu audiencia
7. ✅ Implementa monitoreo de logs
8. ✅ Configura detección de patrones automática

### Monitoreo Post-Lanzamiento:

- **Diario:** Revisar dashboard admin
- **Semanal:** Analizar audit logs
- **Mensual:** Revisar y ajustar umbrales según datos reales

## Soporte

Para más información, consulta:
- `SECURITY.md` - Documentación técnica completa
- `README.md` - Información general del proyecto
- Supabase Dashboard - Logs y métricas en tiempo real

## Recursos Adicionales

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
