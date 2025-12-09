# Architecture Documentation

This document explains key architectural patterns and decisions in the codebase.

## Registry Pattern

The codebase uses a registry pattern for managing multiple provider implementations. This pattern is used in:

- **Email Mailers** (`src/core/email/mailers/core/registry.ts`)
- **CMS Clients** (`src/features/cms/core/create-cms-client.ts`)
- **Monitoring Services** (`src/core/monitoring/core/monitoring.service.ts`)

### Why Registry Pattern?

The registry pattern allows for:
1. **Multiple Provider Support**: Easy addition of new providers without changing consuming code
2. **Runtime Selection**: Providers can be selected via environment variables
3. **Lazy Loading**: Providers are loaded only when needed
4. **Consistent Interface**: All providers implement the same interface

### Example Usage

```typescript
// Email mailer registry
const mailer = await getMailer(); // Returns provider based on MAILER_PROVIDER env var

// CMS registry
const cms = await createCmsClient('keystatic'); // Returns Keystatic or WordPress client
```

### When to Use Registry Pattern

Use the registry pattern when:
- You have multiple implementations of the same interface
- The implementation needs to be selected at runtime (via env vars)
- You want to support plugin-like extensibility

Don't use it for:
- Single implementations (direct imports are simpler)
- Compile-time only selections (use TypeScript unions instead)

## Module Aliasing (Next.js Config)

The `next.config.ts` file includes module aliasing for development environments to exclude unused modules.

### Why Module Aliasing?

In development, we alias modules to `noop` implementations when they're not needed:
- Sentry (if monitoring provider is not Sentry)
- Nodemailer (if mailer provider is not Nodemailer)
- Turnstile (if captcha is not configured)

This speeds up the development server by not loading unnecessary modules.

### Configuration

```typescript
// next.config.ts
function getModulesAliases(): Record<string, string> {
  const excludeSentry = monitoringProvider !== 'sentry';
  const excludeNodemailer = mailerProvider !== 'nodemailer';
  
  // Aliases unused modules to noop implementation
  if (excludeSentry) {
    aliases['@sentry/nextjs'] = '~/shared/lib/dev-mock-modules';
  }
  // ...
}
```

## Database Client Architecture

### Drizzle Client with RLS

The codebase uses Drizzle ORM with Supabase Row Level Security (RLS). There are two client types:

1. **Admin Client** (`getDrizzleSupabaseAdminClient()`)
   - Bypasses RLS
   - Used for admin operations and health checks
   - Direct database access

2. **RLS Client** (`getDrizzleSupabaseClient()`)
   - Enforces RLS based on NextAuth session
   - Sets up JWT claims for RLS context
   - Provides two methods:
     - `query()`: For single queries with RLS
     - `runTransaction()`: For transactions with RLS

### Why This Pattern?

RLS requires setting up auth context before each query. The client pattern:
- Automatically sets up RLS context
- Cleans up after operations
- Maintains type safety with Drizzle

## Component Organization

### UI vs Makerkit Components

The codebase has two component directories:

1. **`src/shared/components/ui/`**: Base UI components (shadcn/ui style)
   - Simple, reusable components
   - Examples: `Button`, `Input`, `Dialog`, `DataTable` (simple version)

2. **`src/shared/components/makerkit/`**: Application-specific components
   - Feature-rich components with business logic
   - Examples: `DataTable` (full-featured), `GlobalLoader`, `Sidebar`

### When to Use Which?

- **UI Components**: Use for basic, reusable UI primitives
- **Makerkit Components**: Use for application-specific features with business logic

## Feature-Based Organization

Features are organized in `src/features/` with a consistent structure:

```
features/
  feature-name/
    components/     # React components
    hooks/          # React hooks
    server/         # Server actions, API routes
    schema/         # Zod schemas, types
```

This keeps related code together and makes features self-contained.

## Authentication Architecture

### NextAuth Integration

The codebase uses NextAuth v5 for authentication, replacing Supabase Auth. However:

- **Supabase Client** (`useSupabase`) is still used for:
  - Real-time subscriptions (notifications)
  - Non-auth database operations (via Drizzle now)

- **NextAuth** handles:
  - User sessions
  - OAuth providers
  - Credentials (email/password)

### Deprecated Hooks

Some Supabase auth hooks are kept for backward compatibility but are deprecated:
- `useUser` → Use `useSession` from NextAuth
- `useSignOut` → Use `useSignOut` from NextAuth
- `useSignInWithEmailPassword` → Use NextAuth credentials

These will be removed in a future version once all imports are migrated.

## TypeScript Path Aliases

Path aliases are configured in `tsconfig.json`:

- `~/` → `src/app/`
- `~/config/*` → `src/core/config/*`
- `~/components/*` → `src/shared/components/*`
- `~/core/*` → `src/core/*`
- `~/features/*` → `src/features/*`
- `~/shared/*` → `src/shared/*`

These provide clean imports and make refactoring easier.

## Email System

### Current Implementation

- **Provider**: Nodemailer (only one currently)
- **Pattern**: Registry (allows adding more providers later)
- **Templates**: React Email components in `src/core/email/email-templates/`

### Future Considerations

The registry pattern is kept even though only Nodemailer is used because:
- Easy to add Resend, SendGrid, or Postmark later
- Consistent with other multi-provider systems
- No performance overhead (lazy loading)

## Notification System

### Architecture

- **Database**: Persistent notifications in `notifications` table
- **Real-time**: Supabase Realtime subscriptions for live updates
- **Service Layer**: `NotificationsService` for creating notifications
- **Hooks**: React hooks for fetching and streaming notifications

### Why Not a Library?

The notification system is custom-built because:
- Needs database persistence
- Integrates with account system
- Requires real-time updates via Supabase
- Has custom business logic (dismissal, expiration)

Simple toast libraries (like `sonner`, already installed) are used for ephemeral notifications.

## Monitoring System

### Abstract Class Pattern

Monitoring uses an abstract class pattern:

```typescript
abstract class MonitoringService {
  abstract captureException(...): unknown;
  abstract captureEvent(...): unknown;
  abstract identifyUser(...): unknown;
}

// Implementations:
// - SentryMonitoringService
// - ConsoleMonitoringService (dev)
```

This allows:
- Type-safe implementations
- Easy switching between providers
- Consistent interface across providers

## CMS System

### Multi-CMS Support

The codebase supports multiple CMS backends:
- **WordPress**: Via REST API
- **Keystatic**: File-based CMS

The registry pattern allows switching between CMSs via `CMS_CLIENT` environment variable.

## Code Quality Tools

### Ultracite (Biome)

The codebase uses Ultracite (built on Biome) for:
- **Linting**: Replaces ESLint
- **Formatting**: Replaces Prettier
- **Type Checking**: TypeScript strict mode

Benefits:
- Single tool instead of multiple
- Faster (Rust-based)
- Zero-config with sensible defaults
- Built-in Next.js support

### Scripts

- `ultracite check`: Run linter
- `ultracite fix`: Fix linting issues
- `typecheck`: TypeScript type checking

## Environment Variables

Key environment variables:

- `DATABASE_URL` / `SUPABASE_DATABASE_URL`: Database connection
- `MAILER_PROVIDER`: Email provider (default: `nodemailer`)
- `CMS_CLIENT`: CMS backend (`wordpress` or `keystatic`)
- `NEXT_PUBLIC_MONITORING_PROVIDER`: Monitoring service (`sentry` or unset)
- `NEXT_PUBLIC_CAPTCHA_SITE_KEY`: Captcha configuration

## Future Considerations

### Potential Improvements

1. **Email Provider**: Consider Resend for better DX and React Email integration
2. **Real-time**: Could migrate from Supabase Realtime to SSE/WebSockets if moving away from Supabase
3. **Component Consolidation**: Some UI/makerkit components could be further consolidated
4. **NextAuth Stable**: Upgrade to stable version when v5 is released

