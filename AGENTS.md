# AGENTS.md

## Project Overview

Portal is a centralized hub and identity management system for the AllThingsLinux (ATL) community and non-profit. It serves as the single source of truth and entry point for all ATL services including free email, IRC, XMPP, SSH pubnix spaces, web hosting, Discord integration, wiki access, and various developer tools. Users create one ATL identity that provisions and manages access to all services across multiple domains (atl.dev, atl.sh, atl.tools, atl.chat). Built with modern TypeScript patterns and clean architecture for a tech-savvy Linux enthusiast community.

## Setup Commands

- Install deps: `pnpm install`
- Run build: `pnpm build`
- Start production: `pnpm start`
- Start development: `pnpm dev` (request user to run, never run directly)
- Check code: `pnpm check`
- Format code: `pnpm fix`
- Type check: `pnpm type-check`
- Generate auth schema: `pnpm auth:init-schema`
- Generate DB migrations: `pnpm db:generate`
- Run DB migrations: `pnpm db:migrate`
- Push DB schema: `pnpm db:push` (dev only)
- Open DB studio: `pnpm db:studio`
- Seed database: `pnpm db:seed`
- Create admin user: `pnpm create-admin`
- Start database: `docker compose up -d portal-db`

## Tech Stack

- React 19 + Next.js 16 (App Router)
- TypeScript (strict mode)
- TailwindCSS 4 + Shadcn UI (Radix)
- BetterAuth for authentication
- DrizzleORM + PostgreSQL
- Zod for validation
- TanStack Query (React Query) for state management and data fetching
- next-intl for internationalization
- Biome and Ultracite for linting/formatting

## Code Style

- NEVER REMOVE ANYTHING FROM THE CODEBASE WITHOUT ASKING FIRST, ALWAYS FIX IT INSTEAD
- NEVER RUN NEXT DEV, ALWAYS REQUEST THE USER TO RUN IT FOR YOU
- TypeScript strict mode enabled
- Use functional components and hooks
- Prefer composition over inheritance
- Follow Next.js App Router conventions
- Use selective imports over barrel exports for performance
- Single quotes, no semicolons (Biome config)
- Ultracite enforces strict code quality standards
- Write accessible, performant, type-safe code
- Use explicit types for clarity, prefer `unknown` over `any`
- Always await promises in async functions
- Use semantic HTML and ARIA attributes

## Import Aliases

```typescript
import { auth, authClient } from "@/auth";        // Authentication
import { db } from "@/db";                        // Database
import { Button } from "@/components/ui/button";  // UI components
import { usePermissions } from "@/hooks/use-permissions"; // Custom hooks
```

**Current Implementation:**
- Auth module uses barrel exports via `@/auth` index file
- Database uses barrel exports via `@/db` index file  
- UI components use direct imports: `@/components/ui/button`
- Most other modules use direct imports for performance

## Architecture Rules

- **Module boundaries**: Clear separation between client/server code
- **Selective exports**: Use targeted imports over barrel files for performance
- **Authentication**: Use `@/auth` module for all auth operations
- **Database**: Use `@/db` for all database operations
- **Components**: Place reusable components in `@/components`
- **UI**: Use shadcn/ui components from `@/ui/*`

## File Organization

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

## Security Guidelines

- Never expose API keys in client code
- Use BetterAuth for all authentication
- Validate all inputs with Zod schemas
- Implement proper RBAC with permissions module
- Sanitize user inputs in MDX content

## Development Notes

- Use TypeScript paths for imports (configured in tsconfig.json)
- Follow Next.js 16 App Router patterns
- Implement proper error boundaries
- Use Suspense for loading states
- Optimize images with next/image
- Format code with `pnpm fix`
- Database setup uses Docker Compose (`docker compose up -d portal-db`)
- Available MCP tools: shadcn, Better Auth, llms.txt documentation, Next.js Devtools, GitHub, Sentry, Trigger.dev
- Use TanStack Query for all server state management
- Internationalization handled via next-intl with locale files in `locale/` directory