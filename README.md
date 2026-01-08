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

- **Git Hooks**: Husky for pre-commit linting/formatting
- **Version Management**: Mise (optional) for Node.js version management
- **Type Safety**: Strict TypeScript with comprehensive type checking
- **Linting**: Biome for fast linting and formatting
- **Code Quality**: Ultracite for enhanced code quality checks