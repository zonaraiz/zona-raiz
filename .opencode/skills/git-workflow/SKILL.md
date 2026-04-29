---
name: git-workflow
description: Flujo git del proyecto zona_raiz — worktrees por issue, commits semánticos granulares, PR con gh CLI y merge squash. Usar siempre al trabajar con ramas, worktrees, commits o PRs.
compatibility: opencode
---

# Git Workflow — zona_raiz

## Convención de ramas

| Tipo | Formato |
|---|---|
| Feature | `feature/kro-X-slug` |
| Bug fix | `fix/kro-X-slug` |
| Refactor | `refactor/kro-X-slug` |

El slug: título del issue en minúsculas, guiones, máx 5 palabras.
Ejemplos: `feature/kro-123-filtro-ciudad`, `fix/kro-45-error-login`

## Worktrees — estructura estándar

```
~/projects/
├── zona_raiz/               ← repo principal (master)
├── zona_raiz-kro-123-slug/  ← worktree issue 123
└── zona_raiz-kro-124-slug/  ← worktree issue 124
```

```bash
# Crear worktree nuevo desde master
git fetch origin
git worktree add ../zona_raiz-<slug> -b <branch> origin/master

# Retomar worktree existente (rama ya en remoto)
git worktree add ../zona_raiz-<slug> <branch>

# Listar worktrees activos
git worktree list

# Eliminar después del merge
git worktree remove ../zona_raiz-<slug> --force
```

## Commits semánticos — uno por unidad lógica

**Formato:** `<tipo>(<scope>): <descripción en minúsculas>`

| Qué implementaste | Commit |
|---|---|
| Entidad + enums | `feat(domain): add <entity> entity and enums` |
| Puerto | `feat(domain): add <entity> port interface` |
| Servicio | `feat(domain): implement <entity> service` |
| Adapter Supabase | `feat(infra): add supabase <entity> adapter` |
| Schema Yup | `feat(app): add <entity> validation schema` |
| Mapper | `feat(app): add <entity> mapper` |
| Registro en appModule | `feat(app): register <entity> in app module` |
| Server Action | `feat(app): add <entity> server actions` |
| Migración SQL | `feat(db): add <entity> migration and rls policies` |
| Componente UI | `feat(ui): add <entity> form/list/card component` |
| Página/ruta | `feat(ui): add <entity> page route` |
| Bug fix | `fix(<scope>): <descripción concisa>` |

```bash
git add -A
git commit -m "feat(domain): add inquiry entity and enums"
```

**Un commit por unidad lógica — nunca acumular todo al final.**

## Flujo de PR con gh CLI

```bash
# Push
git push -u origin <branch>

# Crear PR
gh pr create \
  --title "feat: KRO-X — título del issue" \
  --body "..." \
  --base master

# Ver estado y checks
gh pr status
gh pr checks <número>

# Merge squash (solo cuando usuario aprueba)
gh pr merge <número> --squash --delete-branch

# Actualizar master local
cd ~/projects/zona_raiz && git pull origin master
```

## Título de PR
`feat: KRO-X — [título del issue en español]`
`fix: KRO-X — [título del issue]`

## Body del PR — template

```markdown
## Descripción
[qué hace este cambio y por qué]

## Issue
Closes KRO-X

## Cambios
- `domain/`: [descripción]
- `infrastructure/`: [descripción]
- `application/`: [descripción]
- `features/`: [descripción]

## Commits
[git log --oneline output]

## Checklist
- [x] `bun tsc --noEmit` pasa
- [x] `bun test:run` pasa
- [x] Patrones del proyecto seguidos
- [x] Traducciones en es/ y en/
```

## Vercel deploy
- Push a rama → preview deploy automático en el PR
- Merge a `master` → deploy a producción automático

## Mensaje de squash merge
`feat: KRO-X — [título] (#PR-número)`
