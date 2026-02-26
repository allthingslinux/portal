# Portal

> Scope: Root project (applies to all subdirectories unless overridden)

Centralized identity and hub management system for the AllThingsLinux (ATL) community. One ATL identity provisions access to all services: email, IRC, XMPP, SSH, web hosting, Discord, wiki access, and developer tools across `atl.dev`, `atl.sh`, `[REDACTED]`, and `atl.chat`.

## Quick Facts

- **Primary Language:** TypeScript (strict mode)
- **Package Manager:** pnpm (never npm/yarn)
- **Framework:** Next.js 16 (App Router)
- **Auth:** BetterAuth
- **Database:** Drizzle ORM + PostgreSQL
- **Key Commands:** `pnpm dev`, `pnpm build`, `pnpm fix`, `pnpm type-check`

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript · TailwindCSS 4 · shadcn/ui (Base) · BetterAuth · Drizzle ORM · PostgreSQL · Zod · TanStack Query · next-intl · Biome / Ultracite

## Repository Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (dashboard)/        # Authenticated dashboard pages
│   ├── api/                # Route handlers (REST endpoints)
│   └── auth/               # Auth pages (login, register, verify)
├── features/               # Feature modules (colocated UI + logic)
│   ├── admin/              # Admin dashboard (users, bans, roles) → see AGENTS.md
│   ├── auth/               # Auth UI, session context, permissions → see AGENTS.md
│   ├── integrations/       # IRC, XMPP, Discord integrations → see AGENTS.md
│   ├── routing/            # Route config, middleware, breadcrumbs → see AGENTS.md
│   └── user/               # User profile & settings → see AGENTS.md
├── shared/                 # Cross-cutting infrastructure
│   ├── api/                # TanStack Query setup, query keys, server queries → see AGENTS.md
│   ├── config/             # App-level config
│   ├── db/                 # Drizzle schema, queries, migrations → see AGENTS.md
│   ├── email/              # Email service (Resend)
│   ├── observability/      # Sentry, OpenTelemetry, web vitals → see AGENTS.md
│   ├── schemas/            # Shared Zod validation schemas → see AGENTS.md
│   ├── security/           # Security utilities
│   ├── seo/                # Metadata helpers
│   ├── types/              # Centralized TypeScript types
│   └── utils/              # Shared utilities & constants
├── components/             # Shared UI components (shadcn + custom)
├── hooks/                  # Shared React hooks
└── i18n/                   # next-intl routing config
```

Supporting files:
```
.agents/
├── code-standards.md       # Coding rules beyond what Biome enforces
└── skills.md               # Available agent skills index
docs/                       # Architecture and reference docs
locale/                     # i18n translation files (en, es, fr, de, pt, zh)
scripts/                    # Utility/maintenance scripts
tests/                      # Test suites (unit, integration)
proxy.ts                    # Next.js middleware (note: named proxy.ts, not middleware.ts)
```

## Common Tasks

### Development
- `pnpm dev` — Start development server (**request user to run, never run directly**)
- `pnpm build` — Build for production
- `pnpm start` — Start production server

### Quality
- `pnpm fix` — Format & lint fix (Biome/Ultracite) — **run before committing**
- `pnpm check` — Check formatting & linting without fixing
- `pnpm type-check` — TypeScript validation

### Database
- `pnpm db:generate` — Generate migration files from schema changes
- `pnpm db:migrate` — Run pending migrations (safe for production)
- `pnpm db:push` — Push schema directly (dev only, never production)
- `pnpm db:studio` — Open Drizzle Studio (GUI)
- `pnpm db:seed` — Seed the database
- `pnpm compose:db` — Start PostgreSQL via Docker Compose

### Auth & Admin
- `pnpm auth:init-schema` — Regenerate BetterAuth schema
- `pnpm create-admin` — Create an admin user

### Testing
- Tests live in `tests/` — see `tests/` for conventions
- `pnpm test` — Run all tests (CI mode)

## Import Aliases

```typescript
import { auth, authClient } from "@/auth"          // Auth module
import { db } from "@/db"                           // Database
import { env } from "@/env"                         // Validated env vars
import { BASE_URL } from "@/config"                 // App config
import { Button } from "@/components/ui/button"     // UI components
import { QUERY_CACHE } from "@/shared/utils/constants" // Constants
import type { SessionData } from "@/types/auth"     // Centralized types
```

## Types & Constants

Types centralized in `src/shared/types/`:
- `@/types/auth` — `SessionData`, `AuthResult`, `UserPermissions`, `Permission`
- `@/types/api` — filters, inputs, responses, error types
- `@/types/routes` — `RouteConfig`, `ProtectedRoute`, `BreadcrumbItem`
- `@/types/common` — DTOs (`UserDTO`, `SessionDTO`, `ApiKeyDTO`)

Constants centralized in `src/shared/utils/constants.ts`:
- `USER_ROLES`, `PERMISSIONS`, `HTTP_STATUS`, `API_ERROR_CODES`
- `QUERY_CACHE` — TanStack Query stale/gc times
- `RATE_LIMIT`, `INTEGRATION_STATUSES`, `PAGINATION`, `VALIDATION_PATTERNS`

## Environment Variables

Each module has its own `keys.ts` file using `@t3-oss/env-nextjs`. The central `src/env.ts` extends all module keys. **Never access `process.env` directly** — always use the `keys()` function from the relevant module.

## Critical Rules

- **Package manager is pnpm**. Never use npm or yarn.
- **Never run `pnpm dev`** — always ask the user to run it.
- **Never delete code** without asking first — fix it instead.
- **Run `pnpm fix` before committing** to ensure Biome/Ultracite compliance.
- **Never use `db:push` in production** — always generate and run migrations.
- **Never access `process.env` directly** — use the module's `keys()` function.
- **Always validate inputs with Zod** — never trust raw external data.

## Guidelines

- [Code Standards](.agents/code-standards.md) — Rules beyond what Biome enforces
- [Project Skills](.agents/skills.md) — Available agent skills index

## Cursor Cloud specific instructions

### Services

| Service | How to start | Port | Required? |
|---------|-------------|------|-----------|
| PostgreSQL 18 | `docker compose up -d portal-db` | 5432 | Yes |
| Next.js dev server | `pnpm dev` | 3000 | Yes |

### Environment setup

A `.env` file at the project root is required with at minimum `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. See the README "Database Setup" and "Getting Started" sections for connection details and defaults.

All integration env vars (Discord, IRC, XMPP, Mailcow, Sentry) are optional — the app starts without them.

### Startup sequence

1. Ensure Docker daemon is running (`sudo dockerd` if not already started)
2. `docker compose up -d portal-db` — start PostgreSQL
3. Wait for healthy: `docker compose ps` should show `(healthy)`
4. `pnpm db:push` — sync schema to dev DB (safe for dev; use `pnpm db:migrate` for prod-like flow)
5. `pnpm dev` — start the dev server on port 3000

### Gotchas

- **`pnpm typegen` before `pnpm type-check`**: Next.js 16 generates `RouteContext` types via `next typegen`. Running `tsc --noEmit` without it first produces `TS2304: Cannot find name 'RouteContext'` errors. The `pnpm build` script runs typegen automatically, but `pnpm type-check` does not.
- **Docker-in-Docker**: The Cloud VM runs inside a container. Docker requires `fuse-overlayfs` storage driver, `iptables-legacy`, and the daemon started via `sudo dockerd`. See the environment snapshot for pre-installed Docker.
- **`pg-native` build script**: The `libpq` native build is not in `onlyBuiltDependencies`. The app falls back to the pure-JS `pg` driver, which works fine for development.
- **Pre-existing test failures**: 2 test files (`tests/app/api/admin/irc-accounts/route.test.ts` and `tests/app/api/bridge/identity/route.test.ts`) fail due to `vi.mock` hoisting issues with t3-env server-side variable access. These are not environment issues — all 118 individual tests pass.

## Finish the Task

- [ ] Run `pnpm fix` before committing.
- [ ] Update the relevant per-directory `AGENTS.md` if you changed structure, commands, or key files.
- [ ] Update root `README.md` if setup steps or ports changed.
- [ ] Summarize changes in conventional commit form (e.g. `feat: ...`, `fix: ...`, `docs: ...`).
