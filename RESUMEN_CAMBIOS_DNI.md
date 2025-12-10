# Resumen de Implementación: Validación de DNI

Este documento detalla los cambios realizados y los pasos necesarios para desplegar la nueva funcionalidad de validación de DNI.

## 1. Base de Datos (⚠️ Acción Requerida)
Se ha creado una nueva migración que agrega la columna `dni_hash` y actualiza la función RPC para prevenir votos duplicados por DNI.

- **Archivo**: [`supabase/migrations/20251207130000_add_dni_validation.sql`](file:///c:/Users/DANIEL/Documents/GitHub/tuvotoimporta/supabase/migrations/20251207130000_add_dni_validation.sql)
- **Instrucción**: 
  1. Abre el Editor SQL de tu proyecto en Supabase.
  2. Copia todo el contenido del archivo mencionado.
  3. Ejecuta el script.

## 2. Backend (Edge Function)
La función `procesar-voto` ha sido modificada para:
- Recibir `dni` y `dni_digit`.
- Validar el formato y dígito verificador (Modulo 11).
- Generar un hash SHA-256 del DNI.
- Enviar el hash a la base de datos.
- Manejar el error `ALREADY_VOTED_DNI` (HTTP 409).

- **Archivo**: [`supabase/functions/procesar-voto/index.ts`](file:///c:/Users/DANIEL/Documents/GitHub/tuvotoimporta/supabase/functions/procesar-voto/index.ts)
- **Despliegue**:
  ```bash
  supabase functions deploy procesar-voto --no-verify-jwt
  ```

## 3. Frontend
Se ha actualizado la interfaz de usuario y la lógica de cliente.

- **Nuevos Archivos**:
  - [`src/lib/dni-validator.ts`](file:///c:/Users/DANIEL/Documents/GitHub/tuvotoimporta/src/lib/dni-validator.ts): Lógica de validación Modulo 11.

- **Archivos Modificados**:
  - [`src/App.tsx`](file:///c:/Users/DANIEL/Documents/GitHub/tuvotoimporta/src/App.tsx): 
    - Nuevos inputs para DNI y Digito Verificador en el modal de voto.
    - Validación en caliente mientras el usuario escribe.
    - Bloqueo del botón "Confirmar" si el DNI es inválido.
  - [`src/lib/api.ts`](file:///c:/Users/DANIEL/Documents/GitHub/tuvotoimporta/src/lib/api.ts):
    - Actualizado `registrarVoto` para enviar los nuevos parámetros.

- **Despliegue**:
  1. Verifica que no haya errores de tipos:
     ```bash
     npm run typecheck
     ```
  2. Construye la aplicación:
     ```bash
     npm run build
     ```
  3. Sube la carpeta `dist/` a tu proveedor de hosting (o haz push si tienes despliegue automático).

## 4. Validación
Una vez desplegado:
1. Intenta votar con un DNI válido y su dígito correcto -> **Éxito**.
2. Intenta votar con un DNI válido pero dígito incorrecto -> **Error en UI (botón deshabilitado/alerta)**.
3. Intenta votar nuevamente con el mismo DNI -> **Error "Este DNI ya ha sido utilizado"**.
