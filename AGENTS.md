# Portal

> Scope: Root project (applies to all subdirectories unless overridden)

Centralized identity and hub management system for the AllThingsLinux (ATL) community. One ATL identity provisions access to all services: email, IRC, XMPP, SSH, web hosting, Discord, wiki access, and developer tools across `atl.dev`, `atl.sh`, `[REDACTED]`, and `atl.chat`.

## Quick Facts

- **Primary Language:** TypeScript (strict mode)
- **Package Manager:** pnpm (never npm/yarn)
- **Monorepo:** Turborepo
- **Framework:** Next.js 16 (App Router)
- **Auth:** BetterAuth v1.5+
- **Database:** Drizzle ORM + PostgreSQL
- **Key Commands:** `pnpm dev`, `pnpm build`, `pnpm fix`, `pnpm type-check`

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript · TailwindCSS 4 · shadcn/ui (Base) · BetterAuth · Drizzle ORM · PostgreSQL · Zod · TanStack Query · next-intl · Biome / Ultracite · Turborepo

## Repository Structure

This is a Turborepo monorepo with workspace packages under `apps/` and `packages/`.

```
apps/
└── portal/                 # Next.js application (App Router)
    ├── src/
    │   ├── app/            # Next.js App Router pages & API routes
    │   │   ├── (dashboard)/  # Authenticated dashboard pages
    │   │   ├── api/        # Route handlers (REST endpoints)
    │   │   └── auth/       # Auth pages (login, register, verify)
    │   ├── features/       # Feature modules (colocated UI + logic)
    │   │   ├── admin/      # Admin dashboard → see AGENTS.md
    │   │   ├── auth/       # Auth UI, session context → see AGENTS.md
    │   │   ├── blog/       # Blog feed UI
    │   │   ├── changelog/  # Changelog viewer
    │   │   ├── feed/       # Linux news RSS feed reader
    │   │   ├── integrations/ # IRC, XMPP, Discord → see AGENTS.md
    │   │   ├── routing/    # Route config, middleware → see AGENTS.md
    │   │   ├── user/       # User profile & settings → see AGENTS.md
    │   │   └── wiki/       # Wiki integration UI
    │   ├── shared/         # App-specific shared code (config, feed, security, wiki, etc.)
    │   ├── hooks/          # Shared React hooks
    │   └── i18n/           # next-intl routing config
    ├── locale/             # i18n translation files (en, es, fr, de, pt, zh)
    ├── scripts/            # Utility/maintenance scripts
    └── tests/              # Test suites (unit, integration)

packages/
├── api/                    # @portal/api — TanStack Query setup, query keys, server queries
├── db/                     # @portal/db — Drizzle schema, client, relations, migrations
├── email/                  # @portal/email — Email service (Resend)
├── observability/          # @portal/observability — Sentry, OpenTelemetry, web vitals
├── schemas/                # @portal/schemas — Shared Zod validation schemas
├── seo/                    # @portal/seo — Metadata helpers
├── types/                  # @portal/types — Centralized TypeScript types
├── ui/                     # @portal/ui — Shared UI components (shadcn + custom)
├── utils/                  # @portal/utils — Shared utilities & constants
└── typescript-config/      # @portal/typescript-config — Shared TS configs
```

Supporting files:
```
.agents/
├── code-standards.md       # Coding rules beyond what Biome enforces
└── skills.md               # Available agent skills index
docs/                       # Architecture and reference docs
turbo.json                  # Turborepo pipeline configuration
```

## Workspace Packages

| Package | Import | Purpose |
|---------|--------|---------|
| `@portal/portal` | N/A (app) | Next.js application |
| `@portal/db` | `@portal/db/*` | Drizzle schema, client, relations, migrations |
| `@portal/api` | `@portal/api/*` | TanStack Query setup, query keys, server queries |
| `@portal/types` | `@portal/types/*` | Centralized TypeScript types |
| `@portal/schemas` | `@portal/schemas/*` | Shared Zod validation schemas |
| `@portal/utils` | `@portal/utils/*` | Shared utilities & constants |
| `@portal/email` | `@portal/email/*` | Email service |
| `@portal/observability` | `@portal/observability/*` | Sentry, OpenTelemetry |
| `@portal/seo` | `@portal/seo/*` | Metadata helpers |
| `@portal/ui` | `@portal/ui/*` | Shared UI components |

## Common Tasks

All commands run from the monorepo root. Turborepo orchestrates cross-package builds.

### Development
- `pnpm dev` — Start development server via Turborepo (**request user to run, never run directly**)
- `pnpm build` — Build all packages + app for production
- `pnpm start` — Start production server (`apps/portal`)

### Quality
- `pnpm fix` — Format & lint fix (Biome/Ultracite) — **run before committing**
- `pnpm check` — Check formatting & linting without fixing
- `pnpm type-check` — TypeScript validation across all packages (via Turborepo)
- `pnpm typegen` — Generate Next.js route types (run before `type-check`)

### Database
- `pnpm db:generate` — Generate migration files from schema changes (`@portal/db`)
- `pnpm db:migrate` — Run pending migrations (safe for production)
- `pnpm db:push` — Push schema directly (dev only, never production)
- `pnpm db:studio` — Open Drizzle Studio (GUI)
- `pnpm db:seed` — Seed the database
- `pnpm compose:db` — Start PostgreSQL via Docker Compose

### Auth & Admin
- `pnpm auth:init-schema` — Regenerate BetterAuth schema
- `pnpm create-admin` — Create an admin user

### Testing
- Tests live in `apps/portal/tests/` — see `tests/` for conventions
- `pnpm test` — Run all tests (CI mode, via Turborepo)

## Import Aliases

Within `apps/portal/`, path aliases resolve to app-local code:

```typescript
import { auth, authClient } from "@/auth"          // Auth module (features/auth/lib)
import { db } from "@portal/db/client"              // Database client (packages/db)
import { env } from "@/env"                         // Validated env vars
import { BASE_URL } from "@/config"                 // App config
```

Workspace packages are imported directly:

```typescript
import { user } from "@portal/db/schema"            // DB schema
import type { SessionData } from "@portal/types/auth" // Types
import { USER_ROLES } from "@portal/utils/constants"  // Constants
import { queryKeys } from "@portal/api/query-keys"    // Query keys
import { Button } from "@portal/ui/button"            // UI components
```

## Types & Constants

Types in `packages/types/src/`:
- `@portal/types/auth` — `SessionData`, `AuthResult`, `UserPermissions`, `Permission`
- `@portal/types/api` — filters, inputs, responses, error types
- `@portal/types/routes` — `RouteConfig`, `ProtectedRoute`, `BreadcrumbItem`
- `@portal/types/common` — DTOs (`UserDTO`, `SessionDTO`, `ApiKeyDTO`)

Constants in `packages/utils/src/constants.ts`:
- `USER_ROLES`, `PERMISSIONS`, `HTTP_STATUS`, `API_ERROR_CODES`
- `QUERY_CACHE` — TanStack Query stale/gc times
- `RATE_LIMIT`, `INTEGRATION_STATUSES`, `PAGINATION`, `VALIDATION_PATTERNS`

## Environment Variables

Each module has its own `keys.ts` file using `@t3-oss/env-nextjs`. The central `apps/portal/src/env.ts` extends all module keys. **Never access `process.env` directly** — always use the `keys()` function from the relevant module.

The `.env` file lives at `apps/portal/.env`.

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

A `.env` file at `apps/portal/.env` is required with at minimum `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. See the README "Database Setup" and "Getting Started" sections for connection details and defaults.

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
- **BetterAuth CLI**: `auth:init-schema` (`npx auth generate`) requires the full import chain to be resolvable. Because the config imports `server-only` modules, the CLI may fail. If needed, apply schema changes manually by referencing the BetterAuth source on GitHub.
- **Drizzle ORM beta**: The project uses `drizzle-orm@1.0.0-beta.15`. BetterAuth's Drizzle adapter doesn't fully support the v1.0 beta yet — runtime works (schema is passed explicitly), but CLI introspection may fail.

## Finish the Task

- [ ] Run `pnpm fix` before committing.
- [ ] Update the relevant per-directory `AGENTS.md` if you changed structure, commands, or key files.
- [ ] Update root `README.md` if setup steps or ports changed.
- [ ] Summarize changes in conventional commit form (e.g. `feat: ...`, `fix: ...`, `docs: ...`).
