# FlowTrack — Despliegue en Dokploy con Docker Compose

> Guía paso a paso para subir **FlowTrack** a [Dokploy](https://dokploy.com) usando Docker Compose.

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Servidor con Dokploy instalado | cualquier |
| Git | 2.x |
| (opcional) Google OAuth App | — |

---

## 1. Preparar el repositorio

```bash
# Asegúrate de que los siguientes archivos están en el repo:
# Dockerfile, docker-compose.yml, .dockerignore, .env.example
git add Dockerfile docker-compose.yml .dockerignore .env.example next.config.ts
git commit -m "chore: add Docker/Dokploy deployment files"
git push
```

> **No subas `.env` al repositorio.** Sólo `.env.example`.

---

## 2. Generar el secreto de NextAuth

Ejecuta esto en cualquier terminal con openssl disponible:

```bash
openssl rand -base64 32
```

Guarda el resultado; lo usarás como `NEXTAUTH_SECRET`.

---

## 3. Crear el proyecto en Dokploy

1. Abre el panel de Dokploy → **Create Project**.
2. Elige **Docker Compose** como tipo.
3. Conecta tu repositorio Git (GitHub / GitLab / Gitea).
4. Selecciona la rama que quieres desplegar (p. ej. `main`).
5. En **Compose file path** deja `docker-compose.yml`.

---

## 4. Configurar las variables de entorno

En la pestaña **Environment** del proyecto, agrega las siguientes variables (una por línea o usando el botón **Add**):

```env
POSTGRES_PASSWORD=<password_seguro>
DATABASE_URL=postgresql://flowtrack:<password_seguro>@db:5432/flowtrack
NEXTAUTH_SECRET=<resultado_del_paso_2>
NEXTAUTH_URL=https://<tu_dominio>
GOOGLE_CLIENT_ID=<opcional>
GOOGLE_CLIENT_SECRET=<opcional>
```

> Asegúrate de que `POSTGRES_PASSWORD` coincide con la contraseña en `DATABASE_URL`.

---

## 5. Configurar el dominio (reverse proxy)

1. En Dokploy ve a **Domains** del servicio `app`.
2. Añade tu dominio (p. ej. `flowtrack.tudominio.com`).
3. Activa **HTTPS / Let's Encrypt** si está disponible en tu panel.
4. Actualiza `NEXTAUTH_URL` para que coincida con el dominio HTTPS definitivo.

---

## 6. Desplegar

Haz clic en **Deploy** (o **Redeploy** si ya existía).

Dokploy ejecutará en orden:

| Servicio | Qué hace |
|---|---|
| `db` | Levanta PostgreSQL 16 con volumen persistente |
| `migrate` | Ejecuta `prisma migrate deploy` + `prisma db seed` |
| `app` | Construye y arranca Next.js en modo producción |

El servicio `migrate` se ejecuta **una sola vez** y luego termina (`restart: "no"`). En despliegues posteriores sólo aplicará las migraciones nuevas.

---

## 7. Verificar

```
https://<tu_dominio>          → pantalla de login de FlowTrack
https://<tu_dominio>/api/auth → respuesta JSON de NextAuth
```

---

## 8. Actualizaciones futuras

Cada vez que hagas `git push` a la rama configurada, Dokploy puede redesplegarse automáticamente (activa **Auto Deploy** en la sección **Deployments**).

Las migraciones de base de datos nuevas se aplican automáticamente en cada redespliegue gracias al servicio `migrate`.

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `migrate` falla con "can't reach db" | Postgres no subió a tiempo | Revisa los logs de `db`; el healthcheck reintenta cada 10 s |
| `Could not find a production build` | El stage `builder` falló | Revisa que las `ARG` de build coinciden con las env vars |
| Error 500 en login | `NEXTAUTH_SECRET` o `NEXTAUTH_URL` mal configurado | Revísalo en la pestaña Environment y redespliega |
| Google sign-in no funciona | Redirect URI no registrada en Google Console | Añade `https://<dominio>/api/auth/callback/google` en Google Cloud Console |

---

## Variables de entorno — referencia rápida

| Variable | Descripción | Ejemplo |
|---|---|---|
| `POSTGRES_PASSWORD` | Contraseña del usuario Postgres | `s3cr3t!` |
| `DATABASE_URL` | Cadena de conexión Prisma | `postgresql://flowtrack:s3cr3t!@db:5432/flowtrack` |
| `NEXTAUTH_SECRET` | Clave de firma JWT (mínimo 32 bytes) | `$(openssl rand -base64 32)` |
| `NEXTAUTH_URL` | URL pública completa de la app | `https://flowtrack.tudominio.com` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID de Google (opcional) | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret de Google (opcional) | `GOCSPX-...` |
