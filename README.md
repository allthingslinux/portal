# Portal

A centralized hub and identity management system for the All Things Linux (ATL) community and non-profit. Portal serves as the single source of truth and entry point for all ATL services, enabling users to create one ATL identity that provisions and manages access to services across multiple domains.

## Overview

Portal provides unified access to:

- Free email services
- IRC and XMPP chat
- SSH pubnix spaces
- Web hosting
- Discord integration
- Wiki access
- Developer tools
- And more...

All services are accessible across multiple domains: `atl.dev`, `atl.sh`, `atl.tools`, `atl.chat`.

## Tech Stack

- **Framework**: React 19 + Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Monorepo**: Turborepo + pnpm workspaces
- **Styling**: TailwindCSS 4 + Shadcn UI (Radix)
- **Authentication**: BetterAuth v1.5+
- **Database**: DrizzleORM + PostgreSQL
- **Validation**: Zod
- **State Management**: TanStack Query (React Query)
- **Internationalization**: next-intl
- **Code Quality**: Biome + Ultracite

## Prerequisites

- Node.js >= 22.18.0 (LTS recommended, managed via `mise` if available)
- pnpm 10.28.2
- PostgreSQL database (PostgreSQL 18 recommended)
- Docker and Docker Compose (for local database setup)

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/portal/.env.example apps/portal/.env
# Edit apps/portal/.env with your configuration. See docs/ENV_VARS.md for the
# canonical variable list and cross-repo bridge token mapping.

# Start PostgreSQL database (Docker Compose)
pnpm compose:db
# or: docker compose up -d portal-db

# Run database migrations
pnpm db:migrate

# (Optional) Seed database with sample data
pnpm db:seed

# Create initial admin user
pnpm create-admin
```

### Development

```bash
# Start development server
pnpm dev

# Alternative development commands:
pnpm dev:turbo        # Use Turbopack for faster builds
pnpm dev:https        # Run with HTTPS enabled
pnpm dev:grab         # React Grab + dev (cursor integration)
pnpm scan             # Start dev server with React Scan (performance profiling)
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### Development

- `pnpm dev` - Start development server
- `pnpm dev:turbo` - Start dev server with Turbopack
- `pnpm dev:https` - Start dev server with HTTPS
- `pnpm dev:grab` - Start dev server with React Grab (cursor integration)
- `pnpm scan` - Start dev server with React Scan (performance profiling)
- `pnpm build` - Build for production (runs typegen then build)
- `pnpm build:debug` - Build with debug output
- `pnpm build:profile` - Build with profiling
- `pnpm build:prerender-debug` - Build with prerender debugging
- `pnpm start` - Start production server

### Code Quality

- `pnpm check` - Run linting and type checking (Ultracite)
- `pnpm fix` - Auto-fix linting and formatting issues
- `pnpm type-check` - Type check without linting
- `pnpm typegen` - Generate Next.js types (run before build for full type checking)
- `pnpm analyze` - Analyze bundle size
- `pnpm analyze:output` - Analyze and output bundle report
- `pnpm deduplicate` - Deduplicate dependencies

### Testing

- `pnpm test` - Run test suite
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage report

### Database

- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes directly (dev only, no migrations)
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:seed:reset` - Reset and reseed database

### Authentication

- `pnpm auth:init-schema` - Generate BetterAuth database schema
- `pnpm create-admin` - Create an admin user

### Docker Compose

- `pnpm compose:db` - Start PostgreSQL container (portal-db)
- `pnpm compose:db:down` - Stop database stack
- `pnpm compose:production` - Start production profile
- `pnpm compose:staging` - Start staging profile
- `pnpm compose:adminer` - Start Adminer for DB management
- `pnpm compose:adminer:down` / `compose:production:down` / `compose:staging:down` - Stop respective profiles

### Utilities

- `pnpm info` - Show Next.js environment information
- `pnpm upgrade` - Upgrade Next.js and dependencies
- `pnpm telemetry:enable` - Enable Next.js telemetry
- `pnpm telemetry:disable` - Disable Next.js telemetry
- `pnpm release` - Run semantic-release for versioning and changelog

## Project Structure

This is a Turborepo monorepo with workspace packages.

```
apps/
└── portal/                 # @portal/portal — Next.js application
    ├── src/
    │   ├── app/            # Next.js App Router
    │   │   ├── (dashboard)/app/  # Protected dashboard routes
    │   │   ├── .well-known/      # OAuth/OpenID discovery endpoints
    │   │   ├── api/              # API routes (admin, auth, integrations, user)
    │   │   └── auth/             # Authentication pages and consent
    │   ├── features/       # Feature modules (auth, admin, integrations, routing, user)
    │   │   └── [name]/lib/ # Feature-specific logic
    │   ├── shared/         # App-specific shared code (config, security, wiki)
    │   ├── hooks/          # Custom React hooks
    │   ├── i18n/           # Internationalization setup
    │   ├── styles/         # Global styles
    │   ├── env.ts          # t3-env validated environment
    │   └── proxy.ts        # Next.js middleware (note: named proxy.ts, not middleware.ts)
    ├── locale/             # i18n translation files
    ├── scripts/            # Utility/maintenance scripts
    └── tests/              # Test suites (unit, integration)

packages/
├── api/                    # @portal/api — TanStack Query setup, query keys, server queries
├── db/                     # @portal/db — Drizzle schema, client, relations, migrations
│   ├── src/schema/         # Schema files (auth, api-keys, integrations, irc, xmpp, oauth)
│   └── drizzle/            # Generated migration files
├── email/                  # @portal/email — Email service (Resend)
├── observability/          # @portal/observability — Sentry, OpenTelemetry, web vitals
├── schemas/                # @portal/schemas — Shared Zod validation schemas
├── seo/                    # @portal/seo — Metadata, JSON-LD, robots, sitemap
├── types/                  # @portal/types — Centralized types (auth, api, routes, common)
├── ui/                     # @portal/ui — Shared UI components (shadcn + custom)
├── utils/                  # @portal/utils — Constants, date, error, string helpers
└── typescript-config/      # @portal/typescript-config — Shared TS configs
```

Path aliases within `apps/portal/`: `@/auth` → `src/features/auth/lib`, `@/db` → `packages/db` (via workspace), `@/config` → `src/shared/config`, `@/ui/*` → `packages/ui` (via workspace). Workspace packages use `@portal/*` imports. See [docs/PATH_ALIASES.md](./docs/PATH_ALIASES.md).

## Database Setup

The project includes a Docker Compose configuration for local PostgreSQL development:

```bash
# Start PostgreSQL container
pnpm compose:db
# or: docker compose up -d portal-db

# The database will be available at:
# - Host: localhost
# - Port: 5432
# - User: postgres
# - Password: postgres
# - Database: portal
```

Update your `apps/portal/.env` file with the database connection string:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portal
```

### Bridge ↔ atl.chat token

When integrating with the atl.chat bridge (identity API), set `BRIDGE_SERVICE_TOKEN` to the same value as atl.chat's `BRIDGE_PORTAL_TOKEN`. Both sides use the same secret; the env var names differ per repo.

## Architecture

### Import Aliases

The project uses TypeScript path aliases for clean imports within `apps/portal/` (`@/auth` → `src/features/auth/lib`, `@/config` → `src/shared/config`). Workspace packages are imported via `@portal/*` (e.g., `@portal/db/client`, `@portal/types/auth`). See [docs/PATH_ALIASES.md](./docs/PATH_ALIASES.md).

```typescript
import { auth, authClient } from "@/auth";                 // Authentication
import { db } from "@portal/db/client";                    // Database
import { BASE_URL } from "@/config";                       // App config
import { Button } from "@portal/ui/button";                // UI components
import type { SessionData } from "@portal/types/auth";     // Types
import { USER_ROLES } from "@portal/utils/constants";      // Constants
```

### Module Organization

- **Barrel Exports**: Core modules (`@/auth`, `@/config`) use barrel exports for convenience
- **Workspace Packages**: Shared code lives in `packages/` and is imported via `@portal/*`
- **Direct Imports**: UI components (`@portal/ui/*`) and shared utils use direct imports for performance
- **Types**: Centralized in `packages/types/src/` (auth, api, routes, common); constants in `packages/utils/src/constants.ts`
- **Environment**: Validated via `@t3-oss/env-nextjs` in `apps/portal/src/env.ts`, extending module-level `keys()` functions
- **Clear Boundaries**: Strict separation between client and server code
- **Type Safety**: Full TypeScript coverage with strict mode enabled

### Authentication

Portal uses BetterAuth for authentication with role-based access control (RBAC):

- **Roles**: `user`, `staff`, `admin`
- **Permissions**: Granular permission system for fine-grained access control
- **OAuth**: Support for OAuth2 provider functionality (as both client and provider)
- **Passkeys**: Modern passwordless authentication support
- **Email**: Built-in email verification and password reset flows

### Database

- **ORM**: DrizzleORM for type-safe database queries (via `@portal/db` workspace package)
- **Migrations**: Version-controlled schema changes via Drizzle Kit (in `packages/db/drizzle/`)
- **Relations**: Properly defined relationships between entities (in `packages/db/src/relations.ts`)
- **Schemas**: Modular schema organization in `packages/db/src/schema/` (auth, oauth, api-keys, etc.)

### Internationalization

The project uses `next-intl` for multi-language support:

- **Locale files**: Located in `locale/` directory
- **Routing**: Automatic locale-based routing
- **Translations**: JSON-based translation files

### Development Tools

- **Git Hooks**: Husky for pre-commit linting/formatting and commit message validation
- **Version Management**: Mise (optional) for Node.js version management
- **Type Safety**: Strict TypeScript with comprehensive type checking
- **Linting**: Biome for fast linting and formatting
- **Code Quality**: Ultracite for enhanced code quality checks
- **Testing**: Vitest for unit and integration tests
- **CI/CD**: GitHub Actions for automated testing and deployment

## Architecture Overview

### Module Boundaries

Portal follows a Turborepo monorepo pattern with shared code extracted into workspace packages:

- **`packages/`**: Shared workspace packages
  - `db/` (`@portal/db`) - Database client, schema, relations, and migration config
  - `api/` (`@portal/api`) - API client, query keys, server queries
  - `types/` (`@portal/types`) - Centralized types (auth, api, routes, common)
  - `schemas/` (`@portal/schemas`) - Shared Zod validation schemas
  - `utils/` (`@portal/utils`) - Constants, date, error, string helpers
  - `email/` (`@portal/email`) - Email service
  - `observability/` (`@portal/observability`) - Sentry, OpenTelemetry, logging
  - `seo/` (`@portal/seo`) - Metadata, JSON-LD, robots, sitemap
  - `ui/` (`@portal/ui`) - Shared UI components

- **`apps/portal/src/shared/`**: App-specific shared code
  - `config/` - Application configuration
  - `security/` - Security utilities (nonce, etc.)

- **`apps/portal/src/features/`**: Feature modules (auth, admin, integrations, routing, user)
  - Each feature may have `lib/`, `components/`, `hooks/`, `api/`
  - Auth lives at `@/auth` → `src/features/auth/lib`
  - Integrations registry at `src/features/integrations/lib/core/registry.ts`

- **`apps/portal/src/components/`**: React components
  - `ui/` - Base shadcn/ui components
  - `layout/` - Layout components (header, sidebar, navigation, page)

- **`apps/portal/src/hooks/`**: Custom React hooks (e.g. use-mobile, use-permissions, use-image-preview)

- **`apps/portal/src/app/`**: Next.js App Router
  - `api/` - API route handlers
  - `(dashboard)/app/` - Protected routes (overview, admin, integrations, settings)
  - `auth/` - Authentication and consent pages
  - `.well-known/` - OAuth/OpenID discovery endpoints

### Server/Client Code Separation

**Server-Only Code**:

- Mark with `"use server"` directive or `import "server-only"`
- API route handlers (`apps/portal/src/app/api/`)
- Server actions
- Database queries (via `@portal/db`)
- Auth utilities (`apps/portal/src/features/auth/lib/server-client.ts`, imported via `@/auth`)

**Client Code**:

- Mark with `"use client"` directive
- React components with interactivity
- Client-side hooks
- Browser APIs (localStorage, window)

**Pattern**:

```typescript
// Server-only
import "server-only"
import { auth } from "@/auth"

// Client component
"use client"
import { authClient } from "@/auth/client"
```

### Integration Framework

Portal uses a registry pattern for integrations:

- **Registry**: `apps/portal/src/features/integrations/lib/core/registry.ts`
- **Factory**: `apps/portal/src/features/integrations/lib/core/factory.ts`
- **Base Class**: `BaseIntegration` in `apps/portal/src/features/integrations/lib/core/base.ts`
- **Registration**: Integrations register themselves on module load

**Adding a New Integration**:

1. Create integration module in `apps/portal/src/features/integrations/lib/[name]/`
2. Implement `BaseIntegration` interface
3. Register in `apps/portal/src/features/integrations/lib/index.ts`
4. Add environment variables in the integration’s `keys.ts`

### API Design Conventions

**Response Format**:

```typescript
// Success response
Response.json({ ok: true, data: {...} })

// Error response
Response.json({ ok: false, error: "Error message" }, { status: 400 })
```

**Error Handling**:

- Use `APIError` class for API errors
- Use `handleAPIError()` wrapper for consistent error responses
- Errors are logged to Sentry automatically

**Auth Guards**:

- `requireAuth()` - Requires any authenticated user
- `requireAdmin()` - Requires admin role
- `requireAdminOrStaff()` - Requires admin or staff role

**Example API Route**:

```typescript
export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request)
    // ... business logic
    return Response.json({ ok: true, data })
  } catch (error) {
    return handleAPIError(error)
  }
}
```

**API Route Structure**:

- RESTful conventions (`GET`, `POST`, `PATCH`, `DELETE`)
- Route handlers in `apps/portal/src/app/api/[resource]/route.ts`
- Nested resources: `apps/portal/src/app/api/[resource]/[id]/route.ts`
- Use DTOs to prevent exposing sensitive data

### Feature Module Conventions

**When to Create a Feature Module**:

- Feature has multiple related components
- Feature has its own API routes
- Feature has complex business logic
- Feature needs isolation

**Naming Conventions**:

- Use kebab-case for file names (`user-management.tsx`)
- Use PascalCase for component names (`UserManagement`)
- Use camelCase for functions and variables
- Use UPPER_CASE for constants

**Import Patterns**:

- Prefer direct imports for performance: `import { Button } from "@/components/ui/button"`
- Use barrel exports for core modules: `import { auth } from "@/auth"`
- Group imports: external → internal → relative

### Database Conventions

**Schema Organization**:

- Modular schemas in `packages/db/src/schema/`
- One file per domain (auth.ts, oauth.ts, api-keys.ts)
- Relations defined in `packages/db/src/relations.ts`
- Use Drizzle ORM for type-safe queries

**Migrations**:

- Generate migrations: `pnpm db:generate`
- Review generated SQL before committing
- Run migrations: `pnpm db:migrate`
- Never edit migration files manually after generation

**Query Patterns**:

- Use DTOs (Data Transfer Objects) to select only needed fields
- Avoid selecting entire tables (`SELECT *`)
- Use transactions for multi-step operations
- Handle errors gracefully

## Operational Prerequisites

### Local Development

**Required Services**:

- PostgreSQL 18+ (via Docker Compose)
- Node.js 22.18.0+
- pnpm 10.28.2

**Environment Variables**:

- Database connection (`DATABASE_URL`) — in `apps/portal/.env`
- BetterAuth configuration (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
- Optional integrations (XMPP, Sentry, etc.)

**Health Checks**:

- Database: `docker compose ps portal-db`
- Application: `curl http://localhost:3000/api/health` (if implemented)

### CI/CD Requirements

**GitHub Actions**:

- Runs on Node.js 22.x
- Requires pnpm 10.28.2
- Caches pnpm dependencies
- Runs: lint, type-check, build, test

**Pre-commit Checks**:

- Linting and formatting (via lint-staged)
- Commit message validation (via commitlint)

**Branch Protection**:

- Require CI checks to pass
- Require PR reviews
- Enforce conventional commits

### Production Deployment

**Build Requirements**:

- Node.js >= 22.18.0
- pnpm 10.28.2
- PostgreSQL 18+

**Environment Setup**:

- Set all required environment variables
- Run database migrations before deployment
- Ensure database connection is stable
- Configure Sentry for error tracking

**Post-Deployment**:

- Verify health endpoints
- Check Sentry for errors
- Monitor database connections
- Verify authentication flows

## Documentation

- **[.github/CONTRIBUTING.md](./.github/CONTRIBUTING.md)** - Contribution guidelines and development workflow
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Architecture overview and design patterns
- **[docs/API.md](./docs/API.md)** - REST API documentation and endpoints
- **[docs/COMPONENTS.md](./docs/COMPONENTS.md)** - Component conventions and usage
- **[docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md)** - Accessibility guidelines and best practices
- **[docs/TESTING.md](./docs/TESTING.md)** - Testing patterns and best practices
- **[docs/CI_CD.md](./docs/CI_CD.md)** - CI/CD workflows and deployment guide
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide
- **[docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md)** - Integration framework documentation
- **[docs/LOGGING.md](./docs/LOGGING.md)** - Logging and observability
- **[docs/ENV_VARS.md](./docs/ENV_VARS.md)** - Canonical env vars and bridge mappings
- **[docs/PATH_ALIASES.md](./docs/PATH_ALIASES.md)** - TypeScript path alias usage
- **[docs/TSCONFIG.md](./docs/TSCONFIG.md)** - TypeScript configuration reference
