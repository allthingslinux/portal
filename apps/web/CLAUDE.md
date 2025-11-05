# Web Application Instructions

This file contains instructions specific to the main Next.js web application.

## Application Structure

### Route Organization

```
app/
├── (marketing)/          # Public pages (landing, blog, docs)
├── (auth)/              # Authentication pages
├── home/
│   ├── (user)/          # Personal account context
│   └── [account]/       # Team account context ([account] = team slug)
├── admin/               # Super admin section
└── api/                 # API routes
```

Key Examples:

- Marketing layout: `app/(marketing)/layout.tsx`
- Personal dashboard: `app/home/(user)/page.tsx`
- Team workspace: `app/home/[account]/page.tsx`
- Admin section: `app/admin/page.tsx`

### Component Organization

- **Route-specific**: Use `_components/` directories
- **Route utilities**: Use `_lib/` for client, `_lib/server/` for server-side
- **Global components**: Root-level directories

Example:

- Team components: `app/home/[account]/_components/`
- Team server utils: `app/home/[account]/_lib/server/`
- Marketing components: `app/(marketing)/_components/`

The `[account]` parameter is the `accounts.slug` property, not the ID

## React Server Components - Async Pattern

**CRITICAL**: In Next.js 15, always await params directly in async server components:

```typescript
// ❌ WRONG - Don't use React.use() in async functions
async function Page({ params }: Props) {
  const { account } = use(params);
}

// ✅ CORRECT - await params directly in Next.js 15
async function Page({ params }: Props) {
  const { account } = await params; // ✅ Server component pattern
}

// ✅ CORRECT - "use" in non-async functions in Next.js 15
function Page({ params }: Props) {
  const { account } = use(params); // ✅ Server component pattern
}
```

## Data Fetching Strategy

**Quick Decision Framework:**

- **Server Components**: Default choice for initial data loading
- **Client Components**: For interactive features requiring hooks or real-time updates
- **Admin Client**: Only for bypassing RLS (rare cases - requires manual auth/authorization)

### Server Components (Preferred) ✅

```typescript
import { getSupabaseServerClient } from '@portal/supabase/server-client';

async function NotesPage() {
  const client = getSupabaseServerClient();
  const { data, error } = await client.from('notes').select('*');

  if (error) return <ErrorMessage error={error} />;
  return <NotesList notes={data} />;
}
```

**Key Insight**: Server Components automatically inherit RLS protection - no additional authorization checks needed!

### Client Components (Interactive) 🖱️

```typescript
'use client';
import { useSupabase } from '@portal/supabase/hooks/use-supabase';
import { useQuery } from '@tanstack/react-query';

function InteractiveNotes() {
  const supabase = useSupabase();
  const { data, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => supabase.from('notes').select('*')
  });

  if (isLoading) return <Spinner />;
  return <NotesList notes={data} />;
}
```

### Performance Optimization - Parallel Data Fetching 🚀

**Sequential (Slow) Pattern ❌**

```typescript
async function SlowDashboard() {
  const userData = await loadUserData();
  const notifications = await loadNotifications();
  const metrics = await loadMetrics();
  // Total time: sum of all requests
}
```

**Parallel (Optimized) Pattern ✅**

```typescript
async function FastDashboard() {
  // Execute all requests simultaneously
  const [userData, notifications, metrics] = await Promise.all([
    loadUserData(),
    loadNotifications(),
    loadMetrics()
  ]);
  // Total time: longest single request

  return <Dashboard user={userData} notifications={notifications} metrics={metrics} />;
}
```

**Performance Impact**: Parallel fetching can reduce page load time by 60-80% for multi-data pages!

## Authorization Patterns - Critical Understanding 🔐

### RLS-Protected Data Fetching (Standard) ✅

```typescript
async function getUserNotes(userId: string) {
  const client = getSupabaseServerClient();

  // RLS automatically ensures user can only access their own notes
  // NO additional authorization checks needed!
  const { data } = await client.from('notes').select('*').eq('user_id', userId); // RLS validates this automatically

  return data;
}
```

### Admin Client Usage (Dangerous - Rare Cases Only) ⚠️

```typescript
async function adminGetUserNotes(userId: string) {
  const adminClient = getSupabaseServerAdminClient();

  // CRITICAL: Manual authorization required - bypasses RLS!
  const currentUser = await getCurrentUser();
  if (!(await isSuperAdmin(currentUser))) {
    throw new Error('Unauthorized: Admin access required');
  }

  // Additional validation: ensure current admin isn't targeting themselves
  if (currentUser.id === userId) {
    throw new Error('Cannot perform admin action on own account');
  }

  // Now safe to proceed with admin privileges
  const { data } = await adminClient
    .from('notes')
    .select('*')
    .eq('user_id', userId);

  return data;
}
```

**Rule of thumb**: If using standard Supabase client, trust RLS. If using admin client, validate everything manually.

## Internationalization

Always use `Trans` component from `@portal/ui/trans`:

```tsx
import { Trans } from '@portal/ui/trans';

<Trans
  i18nKey="user:welcomeMessage"
  values={{ name: user.name }}
/>

// With HTML elements
<Trans
  i18nKey="terms:agreement"
  components={{
    TermsLink: <a href="/terms" className="underline" />,
  }}
/>
```

### Adding New Languages

1. Add language code to `lib/i18n/i18n.settings.ts`
2. Create translation files in `public/locales/[new-language]/`
3. Copy structure from English files

### Adding new namespaces

1. Translation files: `public/locales/<locale>/<namespace>.json`
2. Add namespace to `defaultI18nNamespaces` in `apps/web/lib/i18n/i18n.settings.ts`

## Workspace Contexts 🏢

### Personal Account Context (`app/home/(user)`)

```tsx
import { useUserWorkspace } from '@portal/accounts/hooks/use-user-workspace';

function PersonalComponent() {
  const { user, account } = useUserWorkspace();
  // Personal account data
}
```

Context provider: `@packages/features/accounts/src/components/user-workspace-context-provider.tsx`

### Team Account Context (`app/home/[account]`)

```tsx
import { useTeamAccountWorkspace } from '@portal/team-accounts/hooks/use-team-account-workspace';

function TeamComponent() {
  const { account, user, accounts } = useTeamAccountWorkspace();
  // Team account data with permissions
}
```

Context provider: `@packages/features/team-accounts/src/components/team-account-workspace-context-provider.tsx`

## Key Configuration Files

- **Feature flags**: `config/feature-flags.config.ts`
- **i18n settings**: `lib/i18n/i18n.settings.ts`
- **Supabase config**: `supabase/config.toml`
- **Middleware**: `middleware.ts`

## Route Handlers (API Routes)

Use `enhanceRouteHandler` from `@packages/next/src/routes/index.ts`:

```typescript
import { enhanceRouteHandler } from '@portal/next/routes';

export const POST = enhanceRouteHandler(
  async function ({ body, user, request }) {
    // body is validated, user available if auth: true
    return NextResponse.json({ success: true });
  },
  {
    auth: true,
    schema: ZodSchema,
  },
);
```

## Navigation Menu Configuration 🗺️

### Adding Sidebar Menu Items

**Config Files:**

- Personal: `config/personal-account-navigation.config.tsx`
- Team: `config/team-account-navigation.config.tsx`

**Add to Personal Navigation:**

```typescript
{
  label: 'common:routes.yourFeature',
  path: pathsConfig.app.yourFeaturePath,
  Icon: <YourIcon className="w-4" />,
  end: true,
},
```

**Add to Team Navigation:**

```typescript
{
  label: 'common:routes.yourTeamFeature',
  path: createPath(pathsConfig.app.yourTeamFeaturePath, account),
  Icon: <YourIcon className="w-4" />,
},
```

**Add Paths:**

```typescript
// config/paths.config.ts
app: {
  yourFeaturePath: '/home/your-feature',
  yourTeamFeaturePath: '/home/[account]/your-feature',
}
```

**Add Translations:**

```json
// public/locales/en/common.json
"routes": {
  "yourFeature": "Your Feature"
}
```

## Security Guidelines 🛡️

### Authentication & Authorization

- Authentication already enforced by middleware
- Authorization handled by RLS at database level (in most cases)
- Avoid defensive code - use RLS instead
- When using the Supabase admin client, must enforce both authentication and authorization

### Passing data to the client

- **Never pass sensitive data** to Client Components
- **Never expose server environment variables** to client (unless prefixed with NEXT_PUBLIC)
- Always validate user input
