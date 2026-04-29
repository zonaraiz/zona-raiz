---
name: workflows
description: >
  Flujos de trabajo del proyecto zona_raiz: desarrollo local, migraciones Supabase,
  cache tags, testing con Vitest, deploy. Usar al preguntar sobre comandos, migraciones,
  cache, tests, o cualquier tarea del ciclo de desarrollo.
---

# Flujos de Trabajo — zona_raiz

## Comandos del proyecto

```bash
# Desarrollo
bun dev                        # Next.js dev server
bun build                      # build de producción
bun lint                       # ESLint

# Testing
bun test                       # Vitest watch mode
bun test:run                   # una ejecución (CI)
bun test:watch                 # watch explícito
bun test:coverage              # con cobertura

# Supabase local
bun supabase:start             # levanta Docker + Supabase local
bun supabase:stop              # detiene Supabase
bun supabase:status            # estado de servicios
bun supabase:reset             # reset completo de BD local
bun supabase:migration:new     # crear migración nueva

# Supabase producción
bun supabase:db:push           # aplica migraciones en producción
bun supabase:gen:types         # genera tipos → types/supabase.ts

# TypeScript
bun tsc --noEmit               # type check sin compilar
```

## Migraciones de base de datos

```bash
# 1. Crear migración
bun supabase:migration:new nombre-descriptivo
# → supabase/migrations/<timestamp>_nombre-descriptivo.sql

# 2. Escribir el SQL

# 3. Aplicar en local
bun supabase:reset

# 4. Regenerar tipos
bun supabase:gen:types
# → tipos/supabase.ts

# 5. Aplicar en producción
bun supabase:db:push
```

### Template de migración

```sql
-- Tabla con RLS multi-tenant
CREATE TABLE IF NOT EXISTS public.mi_tabla (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id uuid NOT NULL REFERENCES public.real_estates(id) ON DELETE CASCADE,
  name          text NOT NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.mi_tabla ENABLE ROW LEVEL SECURITY;

-- Solo ve sus propios datos
CREATE POLICY "tenant_isolation_mi_tabla"
  ON public.mi_tabla FOR ALL
  USING (
    real_estate_id IN (
      SELECT real_estate_id FROM public.real_estate_agents
      WHERE profile_id = auth.uid()
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_mi_tabla_real_estate ON public.mi_tabla(real_estate_id);
CREATE INDEX IF NOT EXISTS idx_mi_tabla_created_at ON public.mi_tabla(created_at DESC);
```

## Cache — CACHE_TAGS

Todos los tags están en `infrastructure/config/constants.ts`. Usar **siempre** las constantes, nunca strings crudos, si se crea un feauture con entidad nueva documentar en actuales:

```typescript
// En Server Actions — invalidar al mutar
revalidateTag(CACHE_TAGS.PROPERTY.ALL, { expire: 0 });
revalidateTag(CACHE_TAGS.PROPERTY.DETAIL(id), { expire: 0 });
revalidateTag(CACHE_TAGS.PROPERTY.PRINCIPAL, { expire: 0 });

//example:
revalidateTag(CACHE_TAGS.AGENT.PRINCIPAL, { expire: 0 });
revalidateTag(CACHE_TAGS.AGENT.BY_REAL_ESTATE(real_estate_id), { expire: 0 });

// En Services — leer con cache
unstable_cache(fn, CACHE_TAGS.KEY.SOME() | CACHE_TAGS.KEY.SOME, { revalidate: 300, tags: [CACHE_TAGS.SOME, CACHE_TAGS.SOME] })

//example: 
  getCachedById(id: string) {
    return unstable_cache(
      async () => this.listingPort.findById(id),
      [CACHE_TAGS.LISTING.KEYS.BY_ID(id)],
      {
        revalidate: 300,
        tags: [CACHE_TAGS.LISTING.PRINCIPAL, CACHE_TAGS.LISTING.DETAIL(id)],
      },
    )();
  }
```

Tags actuales: `
  SESSION,
  LISTING,
  PROPERTY,
  USER,
  REAL_ESTATE,
  AGENT,
  DASHBOARD,
  IMPORT_JOB,
  ENQUIRY,
`.

**Al añadir una entidad nueva**, agregar sus tags en `constants.ts`:
```typescript
MY_ENTITY: {
  PRINCIPAL: "my-entities",
  ALL: "my-entity:all",
  COUNT: "my-entity-count",
  DETAIL: (id: string) => `my-entity:${id}`,
  KEYS: {
    ALL: (filter?: object) =>
      filter ? `listing:all:${JSON.stringify(filter)}` : "listing:all",
    BY_ID: (id: string) => `listing:${id}`
  }
},
```

## Testing

### Stack
- **Vitest 2** + **Testing Library** para unit/integration
- **Playwright** para E2E

### Patrón — servicios de dominio (prioridad)

```typescript
// __tests__/domain/services/my-entity.service.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MyEntityService } from "@/domain/services/my-entity.service";
import { MyEntityPort } from "@/domain/ports/my-entity.port";

describe("MyEntityService", () => {
  let service: MyEntityService;
  let mockRepo: MyEntityPort;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      // ...todos los métodos del port
    };
    service = new MyEntityService(mockRepo);
  });

  it("crea entidad correctamente", async () => {
    vi.mocked(mockRepo.create).mockResolvedValue({ id: "1", name: "Test" });
    const result = await service.create({ name: "Test" });
    expect(result.name).toBe("Test");
    expect(mockRepo.create).toHaveBeenCalledWith({ name: "Test" });
  });
});
```

### Patrón — componentes React

```typescript
// __tests__/features/my-feature/my-component.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("muestra error si campo vacío", async () => {
  render(<MyForm />);
  await userEvent.click(screen.getByRole("button", { name: /guardar/i }));
  expect(screen.getByText(/requerido/i)).toBeInTheDocument();
});
```

Setup en `__tests__/setup/components.tsx` — revisar para wrappers de providers.

### Qué NO testear directamente
- Adapters de Supabase (testear el servicio con mock del port)
- Server Actions directamente
- Componentes de página de Next.js

## Gestión de issues

**Solo Linear** — nunca GitHub Issues ni otros tableros.
Ver skill `linear-planning` (`.opencode/skills/linear-planning/`) para el flujo completo.

## Variables de entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=    # solo server-side

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# hCaptcha
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=

# Google OAuth
GOOGLE_CLIENT_ID=
```

## Checklist antes de hacer commit

- [ ] `bun tsc --noEmit` sin errores
- [ ] `bun test:run` pasa
- [ ] `bun lint` sin warnings nuevos
- [ ] Si hubo cambios de schema: migración creada y tipos regenerados
- [ ] Cache tags invalidados en los actions correspondientes
- [ ] Sin `any` nuevo en TypeScript (excepto mappers)
- [ ] Traducciones añadidas en `locales/es/` y `locales/en/`
