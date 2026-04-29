# zona_raiz 🏠

Plataforma inmobiliaria multi-tenant con Next.js 16 + Supabase.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Características

- **Multi-tenant**: Múltiples inmobiliarias en una sola instancia
- **Autenticación**: OAuth Google + Email/OTP
- **Propiedades**: Gestión completa de propiedades con imágenes
- **Listados**: Publicación y búsqueda de propiedades
- **Importación**: Importación masiva desde Excel/CSV
- **i18n**: Soporte para español e inglés
- **Dashboard**: Panel de administración completo

## 🛠️ Tech Stack

| Capa | Tecnología |
|------|-------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Estilos | Tailwind CSS, shadcn/ui, Radix UI |
| Base de datos | PostgreSQL 15 (Supabase) |
| Auth | Supabase Auth + Google OAuth |
| Storage | MinIO (S3-compatible) |
| Formularios | React Hook Form + Yup |
| Testing | Vitest |
| i18n | i18next |
| Despliegue | Docker, Vercel/Docker |

## 📋 Requisitos

- Node.js 20.x
- bun 10.x
- Docker (para despliegue con contenedor)
- Supabase (cloud o self-hosted)

## 🏃‍♂️ Inicio rápido

### Desarrollo local

```bash
# Instalar dependencias
bun install

# Iniciar Supabase local
bun supabase:start

# Copiar variables de entorno
cp .env.example .env

# Ejecutar migraciones
bun supabase:db:push

# Iniciar servidor de desarrollo
bun dev
```

### Produccion con Docker

El proyecto se despliega como un contenedor Docker independente. Supabase debe estar disponible como servicio externo (cloud o self-hosted).

```bash
# Clonar repositorio
git clone https://github.com/jstcode99/zona_raiz.git
cd zona_raiz

# Configurar variables de entorno
cp .env.example .env
# Editar .env con valores de producción
```

Ver [DEPLOY.md](DEPLOY.md) para documentación completa de despliegue.

## 📁 Estructura del proyecto

```
zona_raiz/
├── app/                    # Next.js App Router
│   └── [lang]/            # i18n routing (es/en)
├── application/           # Server Actions, validación, módulos
├── domain/                # Entidades, puertos, servicios
├── infrastructure/       # Adaptadores (Supabase, cookies, config)
├── features/             # Componentes UI por dominio
├── shared/               # Hooks, utils, redirect
├── supabase/             # Migraciones SQL
├── locales/              # Traducciones (es/en)
└── docker/               # Configuración Docker
```

## 🐳 Docker

### Construir y ejecutar el contenedor

```bash
# Construir la imagen
docker build -t zona_raiz:latest .

# Ejecutar el contenedor
docker run -d \
  --name zona_raiz \
  -p 3000:3000 \
  --env-file .env \
  zona_raiz:latest
```

### Con Docker Compose

```bash
# Iniciar el servicio
docker compose up -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Reiniciar el servicio
docker compose restart nextjs
```

### Variables de entorno requeridas

| Variable | Descripcion | Ejemplo |
|---------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de Supabase (Kong) | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anonima de Supabase | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave service role (SECRETA) | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth | `943984157945-xxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client secret de Google (SECRETO) | `your_google_client_secret` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | API key de Google Maps | `your_google_maps_api_key` |

### Puertos

| Servicio | Puerto | Descripcion |
|----------|--------|-------------|
| Next.js | 3000 | Aplicación principal |

## 🔧 Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `bun dev` | Servidor de desarrollo |
| `bun build` | Build de producción |
| `bun start` | Iniciar producción |
| `bun test` | Ejecutar tests |
| `bun lint` | Linting |
| `bun supabase:start` | Iniciar Supabase local |
| `bun supabase:db:push` | Enviar migraciones |

## 🌐 Endpoints

- **App**: http://localhost:3000 (desarrollo) | http://tu-dominio.com (producción)

## 📄 Licencia

MIT License

---

<div align="center">
  <sub>Construido con ❤️ por zona_raiz</sub>
</div>
