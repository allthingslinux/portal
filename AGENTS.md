# AGENTS.md

## Project Overview

Portal is a centralized hub and identity management system for the AllThingsLinux (ATL) community and non-profit. It serves as the single source of truth and entry point for all ATL services including free email, IRC, XMPP, SSH pubnix spaces, web hosting, Discord integration, wiki access, and various developer tools. Users create one ATL identity that provisions and manages access to all services across multiple domains (atl.dev, atl.sh, atl.tools, atl.chat). Built with modern TypeScript patterns and clean architecture for a tech-savvy Linux enthusiast community.

## Setup Commands

- Install deps: `pnpm install`
- Run build: `pnpm build`
- Start production: `pnpm start`
- Check code: `pnpm check`
- Format code: `pnpm fix`
- Type check: `pnpm type-check`
- Generate auth schema: `pnpm auth:generate-schema`
- Generate DB migrations: `pnpm db:generate`
- Run DB migrations: `pnpm db:migrate`
- Push DB schema: `pnpm db:push`
- Open DB studio: `pnpm db:studio`
- Create admin user: `pnpm create-admin`

## Tech Stack

- React 19 + Next.js 16 (App Router)
- TypeScript (strict mode)
- TailwindCSS 4 + Shadcn UI (Radix)
- BetterAuth for authentication
- DrizzleORM + PostgreSQL
- Zod for validation
- Zustand for state management
- MDX with Remark/Rehype
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
├── app/                  # Next.js App Router
├── components/           # Reusable components
│   ├── ui/               # shadcn/ui (auto-generated)
│   ├── admin/            # Admin components
│   └── layout/           # Layout components
├── lib/                  # Core business logic
│   ├── auth/             # Authentication module
│   └── db/               # Database schemas
├── hooks/                # Custom React hooks
└── styles/               # Global styles
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
- Available MCP tools: shadcn, Better Auth, llms.txt documentation