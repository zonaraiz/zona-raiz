# 🌱 Database Seed - Zona Raíz

Sistema de generación de datos de prueba para desarrollo y testing.

**Este sistema genera un archivo SQL** sin necesidad de conexión a Supabase. El SQL puede ejecutarse en cualquier cliente PostgreSQL.

## 🎯 Uso

### Comandos

```bash
# Generar seed.sql (sin TRUNCATE)
bun seed:sql

# Generar con TRUNCATE (borra datos existentes)
bun seed:sql --truncate

# Ver SQL en consola sin guardar
bun seed:sql --dry-run

# Guardar en archivo específico
bun seed:sql -o mi-seed.sql
```

### Opciones

| Opción | Descripción |
|--------|-------------|
| `--truncate, -t` | Incluir TRUNCATE al inicio del SQL |
| `--output, -o` | Nombre del archivo de salida (default: seed.sql) |
| `--dry-run, -d` | Mostrar SQL en consola sin escribir archivo |
| `--help, -h` | Mostrar ayuda |

### Ejecutar el SQL

```bash
# En Supabase local
psql -h localhost -U postgres -d postgres -f seed/seed.sql

# En Supabase dashboard
# Copiar y pegar el contenido en el SQL Editor

# Con la CLI de Supabase
npx supabase db execute --file seed/seed.sql
```

## 📊 Datos que se Generan

- **Inmobiliarias** - 2 por defecto
- **Perfiles** - Coordinadores, agentes, clientes
- **Propiedades** - 10 por defecto
- **Imágenes** - 3-5 por propiedad
- **Listados** - 1 por propiedad
- **Favoritos** - 5 por defecto
- **Inquiries** - 8 por defecto

## 📁 Estructura

```
seed/
├── generate-sql.ts           # Script CLI
├── seed.sql                   # Archivo generado (en .gitignore)
├── types.ts                   # Tipos TypeScript
├── README.md                  # Este archivo
├── lib/
│   ├── logger.ts             # Utilidades de logging
│   ├── faker-data/           # Generadores de datos fake
│   │   ├── uuid.ts
│   │   ├── real-estates.ts
│   │   ├── profiles.ts
│   │   ├── properties.ts
│   │   ├── listings.ts
│   │   ├── property-images.ts
│   │   ├── favorites.ts
│   │   ├── inquiries.ts
│   │   └── index.ts
│   └── sql-generator/        # Generadores SQL
│       ├── index.ts          # Orquestador principal
│       ├── sql-builder.ts    # Utilidades SQL
│       ├── real-estates.ts
│       ├── profiles.ts
│       ├── real-estate-agents.ts
│       ├── properties.ts
│       ├── property-images.ts
│       ├── listings.ts
│       ├── favorites.ts
│       └── inquiries.ts
└── __tests__/
    └── seed-sql-generator.test.ts
```

## ⚙️ Personalización

Edita `types.ts` → `DEFAULT_SEED_OPTIONS` para cambiar cantidades:

```typescript
export const DEFAULT_SEED_OPTIONS: SeedOptions = {
  realEstateCount: 2,           // Inmobiliarias
  agentsPerRealEstate: 3,      // Agentes por inmobiliaria
  clientsCount: 3,              // Clientes
  propertiesPerRealEstate: 5,   // Propiedades por inmobiliaria
  listingsPerProperty: 1,        // Listados por propiedad
  favoritesCount: 5,             // Favoritos
  inquiriesCount: 8,            // Inquiries
};
```

## ℹ️ Notas

- El archivo `seed.sql` está en `.gitignore` (es generado automáticamente)
- Usa `faker.seed(42)` para reproducibilidad
- No incluye `auth.users` (crear manualmente)
- El orden de inserciones respeta las FKs
