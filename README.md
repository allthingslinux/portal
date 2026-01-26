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
- **Styling**: TailwindCSS 4 + Shadcn UI (Radix)
- **Authentication**: BetterAuth
- **Database**: DrizzleORM + PostgreSQL
- **Validation**: Zod
- **State Management**: TanStack Query (React Query)
- **Internationalization**: next-intl
- **Code Quality**: Biome + Ultracite

## Prerequisites

- Node.js >= 22.18.0 (LTS recommended, managed via `mise` if available)
- pnpm 10.27.0
- PostgreSQL database (PostgreSQL 18 recommended)
- Docker and Docker Compose (for local database setup)

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Create a .env file with your configuration
# Required variables include database connection, BetterAuth configuration, etc.

# Start PostgreSQL database (using Docker Compose)
docker compose up -d portal-db

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
pnpm scan             # Start dev server with React Scan (performance profiling)
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### Development

- `pnpm dev` - Start development server
- `pnpm dev:turbo` - Start dev server with Turbopack
- `pnpm dev:https` - Start dev server with HTTPS
- `pnpm scan` - Start dev server with React Scan (performance profiling)
- `pnpm build` - Build for production
- `pnpm build:debug` - Build with debug output
- `pnpm build:profile` - Build with profiling
- `pnpm build:prerender-debug` - Build with prerender debugging
- `pnpm start` - Start production server

### Code Quality

- `pnpm check` - Run linting and type checking (Ultracite)
- `pnpm fix` - Auto-fix linting and formatting issues
- `pnpm type-check` - Type check without linting
- `pnpm type-check:full` - Full type check with Next.js type generation
- `pnpm typegen` - Generate Next.js types
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

### Utilities

- `pnpm info` - Show Next.js environment information
- `pnpm upgrade` - Upgrade Next.js and dependencies
- `pnpm telemetry:enable` - Enable Next.js telemetry
- `pnpm telemetry:disable` - Disable Next.js telemetry

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected dashboard routes
│   │   └── app/            # Main application routes
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui
│   └── layout/             # Layout components
├── lib/                    # Core business logic
│   ├── auth/               # Authentication module
│   ├── db/                 # Database configuration
│   ├── api/                # API client utilities
│   ├── config/             # Application configuration
│   ├── email/              # Email configuration
│   ├── routes/             # Route utilities and i18n routes
│   ├── seo/                # SEO utilities
│   └── utils/              # General utilities
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization setup
├── styles/                 # Global styles
└── proxy.ts                # Development proxy configuration
```

## Database Setup

The project includes a Docker Compose configuration for local PostgreSQL development:

```bash
# Start PostgreSQL container
docker compose up -d portal-db

# The database will be available at:
# - Host: localhost
# - Port: 5432
# - User: postgres
# - Password: postgres
# - Database: portal
```

Update your `.env` file with the database connection string:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portal
```

## Architecture

### Import Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
import { auth, authClient } from "@/auth";                 // Authentication
import { db } from "@/db";                                 // Database
import { Button } from "@/components/ui/button";           // UI components
import { usePermissions } from "@/hooks/use-permissions";  // Custom hooks
```

### Module Organization

- **Barrel Exports**: Core modules (`@/auth`, `@/db`) use barrel exports for convenience
- **Direct Imports**: UI components and utilities use direct imports for performance
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

- **ORM**: DrizzleORM for type-safe database queries
- **Migrations**: Version-controlled schema changes via Drizzle Kit
- **Relations**: Properly defined relationships between entities
- **Schemas**: Modular schema organization (auth, oauth, api-keys, etc.)

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

Portal follows a clear module organization pattern:

- **`src/lib/`**: Core business logic modules
  - `auth/` - Authentication and authorization
  - `db/` - Database configuration and schemas
  - `api/` - API utilities and helpers
  - `integrations/` - Integration framework
  - `utils/` - Shared utilities

- **`src/components/`**: React components
  - `ui/` - Base shadcn/ui components
  - `layout/` - Layout components (Sidebar, Header)
  - Feature-specific components (admin, integrations)

- **`src/hooks/`**: Custom React hooks
  - Data fetching hooks (use-user, use-admin)
  - UI hooks (use-mobile, use-permissions)

- **`src/app/`**: Next.js App Router
  - `api/` - API route handlers
  - `(dashboard)/` - Protected routes
  - `auth/` - Authentication pages

### Server/Client Code Separation

**Server-Only Code**:

- Mark with `"use server"` directive or `import "server-only"`
- API route handlers (`src/app/api/`)
- Server actions
- Database queries
- Auth utilities (`src/lib/auth/server-client.ts`)

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

- **Registry**: `src/lib/integrations/registry.ts`
- **Factory**: Integration factory for creating instances
- **Base Class**: `BaseIntegration` provides common functionality
- **Registration**: Integrations register themselves on module load

**Adding a New Integration**:

1. Create integration module in `src/lib/integrations/[name]/`
2. Implement `BaseIntegration` interface
3. Register in `src/lib/integrations/index.ts`
4. Add environment variables in `keys.ts`

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
- Route handlers in `src/app/api/[resource]/route.ts`
- Nested resources: `src/app/api/[resource]/[id]/route.ts`
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

- Modular schemas in `src/lib/db/schema/`
- One file per domain (auth.ts, oauth.ts, api-keys.ts)
- Relations defined in `relations.ts`
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
- pnpm 10.27.0

**Environment Variables**:

- Database connection (`DATABASE_URL`)
- BetterAuth configuration (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
- Optional integrations (XMPP, Sentry, etc.)

**Health Checks**:

- Database: `docker compose ps portal-db`
- Application: `curl http://localhost:3000/api/health` (if implemented)

### CI/CD Requirements

**GitHub Actions**:

- Runs on Node.js 22.x
- Requires pnpm 10.27.0
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
- pnpm 10.27.0
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

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines and development workflow
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Architecture overview and design patterns
- **[docs/API.md](./docs/API.md)** - REST API documentation and endpoints
- **[docs/COMPONENTS.md](./docs/COMPONENTS.md)** - Component conventions and usage
- **[docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md)** - Accessibility guidelines and best practices
- **[docs/TESTING.md](./docs/TESTING.md)** - Testing patterns and best practices
- **[docs/CI_CD.md](./docs/CI_CD.md)** - CI/CD workflows and deployment guide
- **[docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md)** - Integration framework documentation
