# Database & Authentication Instructions

This file contains instructions for working with Supabase, database security, and authentication.

## Schemas and Migrations ⚠️

**Critical Understanding**: Schema files are NOT automatically applied to the database!

- **Schemas** (`supabase/schemas/`) represent the desired database state (source of truth)
- **Migrations** (`supabase/migrations/`) are the actual SQL commands that modify the database

### The Required Workflow

1. **Edit schema file** (e.g., `supabase/schemas/18-projects.sql`)
2. **Generate migration**: `pnpm --filter web supabase:db:diff -f migration_name`
   - This compares your schema against the current database and creates a migration
3. **Apply migration**: `pnpm --filter web supabase migrations up`
   - This actually executes the SQL changes in the database

**⚠️ CRITICAL**: Editing a schema file alone does NOTHING to your database. You MUST generate and apply a migration for changes to take effect. Schema files are templates - migrations are the actual database operations.

## Database Security Guidelines ⚠️

**Critical Security Guidelines - Read Carefully!**

### Database Security Fundamentals

- **Always enable RLS** on new tables unless explicitly instructed otherwise
- **NEVER use SECURITY DEFINER functions** without explicit access controls - they bypass RLS entirely
- **Always use security_invoker=true for views** to maintain proper access control
- **Storage buckets MUST validate access** using account_id in the path structure. See `apps/web/supabase/schemas/16-storage.sql` for proper implementation.
- **Use locks if required**: Database locks prevent race conditions and timing attacks in concurrent operations. Make sure to take these into account for all database operations.

### Security Definer Function - Dangerous Pattern ❌

```sql
-- NEVER DO THIS - Allows any authenticated user to call function
CREATE OR REPLACE FUNCTION public.dangerous_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER AS $
BEGIN
  -- This bypasses all RLS policies!
  DELETE FROM sensitive_table; -- Anyone can call this!
END;
$;
GRANT EXECUTE ON FUNCTION public.dangerous_function() TO authenticated;
```

### Security Definer Function - Safe Pattern ✅

```sql
-- ONLY use SECURITY DEFINER with explicit access validation
CREATE OR REPLACE FUNCTION public.safe_admin_function(target_account_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' AS $
BEGIN
  -- MUST validate caller has permission FIRST
  IF NOT public.is_account_owner(target_account_id) THEN
    RAISE EXCEPTION 'Access denied: insufficient permissions';
  END IF;

  -- Now safe to proceed with elevated privileges
  -- Your admin operation here
END;
$;
```

Only grant critical functions to `service_role`:

```sql
grant execute on public.dangerous_function to service_role;
```

## Existing Helper Functions - Use These! 📚

**DO NOT recreate these functions - they already exist:**

```sql
-- Account Access Control
public.has_role_on_account(account_id, role?)     -- Check team membership
public.has_permission(user_id, account_id, permission)  -- Check permissions
public.is_account_owner(account_id)               -- Verify ownership
public.has_active_subscription(account_id)        -- Subscription status
public.is_team_member(account_id, user_id)        -- Direct membership check
public.can_action_account_member(target_account_id, target_user_id) -- Member action rights

-- Administrative Functions
public.is_super_admin()                           -- Super admin check
public.is_aal2()                                  -- MFA verification
public.is_mfa_compliant()                         -- MFA compliance

-- Configuration
public.is_set(field_name)                         -- Feature flag checks
```

Always check `apps/web/supabase/schemas/` before creating new functions!

## RLS Policy Best Practices ✅

```sql
-- Proper RLS using existing helper functions
CREATE POLICY "notes_read" ON public.notes FOR SELECT
  TO authenticated USING (
    account_id = (select auth.uid()) OR
    public.has_role_on_account(account_id)
  );

-- For operations requiring specific permissions
CREATE POLICY "notes_manage" ON public.notes FOR ALL
  TO authenticated USING (
    public.has_permission(auth.uid(), account_id, 'notes.manage'::app_permissions)
  );
```

- **Never modify database.types.ts**: Instead, use the Supabase CLI using our package.json scripts to re-generate the types after resetting the DB

## Type Generation

```typescript
import { Tables } from '@portal/supabase/database';

type Account = Tables<'accounts'>;
```

Always prefer inferring types from generated Database types.

## Client Usage Patterns

### Server Components (Preferred)

```typescript
import { getSupabaseServerClient } from '@portal/supabase/server-client';

async function NotesPage() {
  const client = getSupabaseServerClient();
  const { data, error } = await client.from('notes').select('*');
  
  if (error) return <ErrorMessage error={error} />;

  return <NotesList notes={data} />;
}
```

### Client Components

```typescript
'use client';
import { useSupabase } from '@portal/supabase/hooks/use-supabase';

function InteractiveNotes() {
  const supabase = useSupabase();
  // Use with React Query for optimal data fetching
}
```

### Admin Client (Use with Extreme Caution) ⚠️

```typescript
import { getSupabaseServerAdminClient } from '@portal/supabase/server-admin-client';

async function adminFunction() {
  const adminClient = getSupabaseServerAdminClient();
  
  // CRITICAL: Manual authorization required - bypasses RLS!
  const currentUser = await getCurrentUser();

  if (!(await isSuperAdmin(currentUser))) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Now safe to proceed with admin privileges
  const { data } = await adminClient.from('table').select('*');
}
```

## Authentication Patterns

### Multi-Factor Authentication

```typescript
import { checkRequiresMultiFactorAuthentication } from '@portal/supabase/check-requires-mfa';

const requiresMultiFactorAuthentication = 
  await checkRequiresMultiFactorAuthentication(supabase);

if (requiresMultiFactorAuthentication) {
  // Redirect to MFA page
}
```

### User Requirements

```typescript
import { requireUser } from '@portal/supabase/require-user';

const client = getSupabaseServerClient();
const user = await requireUser(client, { verifyMfa: false });
```

## Storage Security

Storage buckets must validate access using account_id in the path structure:

```sql
-- RLS policies for storage bucket account_image
create policy account_image on storage.objects for all using (
  bucket_id = 'account_image'
  and (
    kit.get_storage_filename_as_uuid(name) = auth.uid()
    or public.has_role_on_account(kit.get_storage_filename_as_uuid(name))
  )
)
with check (
  bucket_id = 'account_image'
  and (
    kit.get_storage_filename_as_uuid(name) = auth.uid()
    or public.has_permission(
      auth.uid(),
      kit.get_storage_filename_as_uuid(name),
      'settings.manage'
    )
  )
);
```

## Common Database Operations

### Creating Tables with RLS

```sql
-- Create table
create table if not exists public.notes (
  id uuid unique not null default extensions.uuid_generate_v4(),
  account_id uuid references public.accounts(id) on delete cascade not null,
  title varchar(255) not null,
  content text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (id)
);

-- Enable RLS
alter table "public"."notes" enable row level security;

-- Grant permissions
grant select, insert, update, delete on table public.notes to authenticated;

-- Create RLS policies
create policy "notes_read" on public.notes for select
  to authenticated using (
    account_id = (select auth.uid()) or
    public.has_role_on_account(account_id)
  );

create policy "notes_write" on public.notes for insert
  to authenticated with check (
    account_id = (select auth.uid()) or
    public.has_permission(auth.uid(), account_id, 'notes.manage'::app_permissions)
  );
```

### Indexes for Performance

```sql
-- Create indexes for common queries
create index if not exists ix_notes_account_id on public.notes (account_id);
create index if not exists ix_notes_created_at on public.notes (created_at);
```

## Error Handling

```typescript
import { getLogger } from '@portal/shared/logger';

async function databaseOperation() {
  const logger = await getLogger();
  const ctx = { name: 'database-operation', accountId: 'account-123' };
  
  try {
    logger.info(ctx, 'Starting database operation');
    const result = await client.from('table').select('*');
    
    if (result.error) {
      logger.error({ ...ctx, error: result.error }, 'Database query failed');
      throw result.error;
    }
    
    return result.data;
  } catch (error) {
    logger.error({ ...ctx, error }, 'Database operation failed');
    throw error;
  }
}
```

## Migration Best Practices

1. Always test migrations locally first
2. Use transactions for complex operations
3. Add proper indexes for new columns
4. Update RLS policies when adding new tables
5. Generate TypeScript types after schema changes
6. Take into account constraints
7. Do not add breaking changes that would distrupt the DB to new migrations

## Common Gotchas

1. **RLS bypass**: Admin client bypasses all RLS - validate manually
2. **Missing indexes**: Always add indexes for foreign keys and commonly queried columns
3. **Security definer functions**: Only use with explicit permission checks
4. **Storage paths**: Must include account_id for proper access control
5. **Type safety**: Always regenerate types after schema changes