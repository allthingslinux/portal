# Portal

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with Keycloak OAuth
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Monitoring**: Sentry
- **i18n**: i18next
- **Package Manager**: Bun
- **Code Quality**: Biome (linting/formatting), Knip (unused dependency checker)

## Prerequisites

- Node.js >= 20.10.0
- Bun
- PostgreSQL 17+
- Docker & Docker Compose (for Keycloak)

## Configuration

Key configuration files:
- `knip.json` - Unused dependency/file checker configuration
- `biome.jsonc` - Linter and formatter configuration
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `postcss.config.mjs` - PostCSS configuration

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/allthingslinux/portal
cd portal
bun install
```

### 2. Environment Variables

Configure required environment variables. See `src/core/config/app.config.ts` and `src/core/config/auth.config.ts` for required values.

**Required**:
- `NEXT_PUBLIC_PRODUCT_NAME`
- `NEXT_PUBLIC_SITE_TITLE`
- `NEXT_PUBLIC_SITE_DESCRIPTION`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_DEFAULT_LOCALE`
- `NEXT_PUBLIC_DEFAULT_THEME_MODE`
- `NEXT_PUBLIC_THEME_COLOR`
- `NEXT_PUBLIC_THEME_COLOR_DARK`
- `KEYCLOAK_ID`
- `KEYCLOAK_SECRET`
- `KEYCLOAK_ISSUER`
- Database connection string

### 3. Start Services

```bash
docker compose up -d
```

This starts PostgreSQL and Keycloak instances.

### 4. Database Setup

```bash
bun run db:setup
```

This runs migrations and seeds the database.

### 5. Development Server

```bash
bun run dev
```

## Scripts

### Development
- `bun run dev` - Start development server
- `bun run build` - Production build
- `bun run start` - Start production server
- `bun run clean` - Clean build artifacts and node_modules

### Code Quality
- `bun run lint` - Run linter (Ultracite)
- `bun run lint:fix` - Fix linting issues
- `bun run typecheck` - TypeScript type checking
- `bun run knip` - Find unused dependencies, exports, and files

### Database
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed database
- `bun run db:setup` - Migrate and seed
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:create-better-auth-tables` - Create Better Auth tables
- `bun run db:push` - Push schema changes to database
- `bun run db:generate` - Generate migration files

### Utilities
- `bun run analyze` - Bundle analyzer for production build

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── core/             # Core configuration and infrastructure
│   ├── auth/         # Better Auth setup
│   ├── config/       # App and auth configuration
│   ├── database/     # Drizzle schema and migrations
│   ├── email/        # Email templates and mailers
│   ├── i18n/         # Internationalization
│   └── monitoring/   # Analytics and Sentry
├── features/         # Feature modules
│   ├── accounts/     # Account management
│   ├── admin/        # Admin features
│   ├── auth/         # Authentication UI
│   ├── cms/          # CMS integration (Keystatic)
│   ├── notifications/# Notification system
│   └── team-accounts/# Team account features
└── shared/           # Shared components and utilities
```

## Development Workflow

### Code Quality

This project uses several tools to maintain code quality:

- **Biome**: Fast linter and formatter for JavaScript/TypeScript
- **Knip**: Finds unused dependencies, exports, and files
- **TypeScript**: Static type checking

Run all quality checks:
```bash
bun run lint && bun run typecheck && bun run knip
```

### Finding Unused Code

Use Knip to identify unused dependencies, exports, and files:

```bash
# Check all files (development mode)
bun run knip

# Check only production code
bun run knip --production

# Auto-fix unused exports and dependencies
bun run knip --fix
```

### Contributing

Before committing:
1. Run all quality checks: `bun run lint && bun run typecheck && bun run knip`
2. Format code: `bun run lint:fix`

### Database Development

When making schema changes:
1. Update schema in `src/core/database/schema.ts`
2. Generate migration: `bun run db:generate`
3. Apply migration: `bun run db:migrate`

## License

See [LICENSE](./LICENSE) file.

