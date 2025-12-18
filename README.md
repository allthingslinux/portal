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

## Prerequisites

- Node.js >= 20.10.0
- Bun
- PostgreSQL 17+
- Docker & Docker Compose (for Keycloak)

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

- `bun run dev` - Start development server
- `bun run build` - Production build
- `bun run lint` - Run linter (Ultracite)
- `bun run lint:fix` - Fix linting issues
- `bun run typecheck` - TypeScript type checking
- `bun run test` - Run Playwright tests
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed database
- `bun run db:setup` - Migrate and seed
- `bun run db:studio` - Open Drizzle Studio

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

## License

See [LICENSE](./LICENSE) file.

