# apps/portal/tests

> Scope: Vitest suite for `@portal/portal`. Inherits monorepo [AGENTS.md](../../../AGENTS.md).

## Layout

| Path | Purpose |
|------|---------|
| `app/api/**` | Route handler tests (e.g. `user/me`, `admin/*`, `bridge/identity`) |
| `hooks/` | React hook tests (`use-permissions`, `use-mobile`, …) |
| `lib/` | Unit tests grouped by domain (`integrations`, `api`, `utils`) — source under test is imported via `@/features/...`, not from `tests/lib` |
| `monorepo/` | Workspace layout / correctness checks |

## Commands

- From monorepo root: `pnpm test` (Turborepo runs portal + packages)
- From `apps/portal`: `pnpm test` → `vitest --run`
- Filter: `pnpm exec vitest run tests/app/api/user/me/route.test.ts` (cwd `apps/portal`)

## Related

- [Monorepo AGENTS.md](../../../AGENTS.md)
- [features/integrations/AGENTS.md](../src/features/integrations/AGENTS.md) — IRC/XMPP/Mailcow integration code under test
