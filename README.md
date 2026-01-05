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
- **State Management**: Zustand
- **Content**: MDX with Remark/Rehype
- **Code Quality**: Biome + Ultracite

## Prerequisites

- Node.js >= 22.18.0
- pnpm 10.27.0
- PostgreSQL database
- Environment variables configured (see `.env.example`)

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
pnpm db:migrate

# Create initial admin user
pnpm create-admin
```

### Development

```bash
# Start development server
pnpm dev

# Run with React Scan (performance profiling)
pnpm scan
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

### Development
- `pnpm dev` - Start development server
- `pnpm scan` - Start dev server with React Scan
- `pnpm build` - Build for production
- `pnpm start` - Start production server

### Code Quality
- `pnpm check` - Run linting and type checking
- `pnpm fix` - Auto-fix linting and formatting issues
- `pnpm type-check` - Type check without linting

### Database
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes directly (dev only)
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:seed:reset` - Reset and reseed database

### Authentication
- `pnpm create-admin` - Create an admin user

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   └── app/                # Protected app routes
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui components (auto-generated)
│   ├── admin/              # Admin-specific components
│   └── layout/             # Layout components
├── lib/                    # Core business logic
│   ├── auth/               # Authentication module
│   │   ├── config.ts       # Auth configuration
│   │   ├── client.ts       # Client-side auth
│   │   ├── permissions.ts  # Access control
│   │   └── index.ts        # Barrel exports
│   └── db/                 # Database configuration
│       ├── client.ts       # Database client
│       ├── schema/         # Database schemas
│       └── index.ts        # Barrel exports
├── hooks/                  # Custom React hooks
└── styles/                 # Global styles
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
- **OAuth**: Support for OAuth2 provider functionality
- **Passkeys**: Modern passwordless authentication support

### Database

- **ORM**: DrizzleORM for type-safe database queries
- **Migrations**: Version-controlled schema changes
- **Relations**: Properly defined relationships between entities