# Super Admin

This file provides specific guidance for AI agents working in the super admin section of the application.

## Core Admin Principles

### Security-First Development

- **ALWAYS** use `AdminGuard` to protect admin pages
- **NEVER** bypass authentication or authorization checks
- **CRITICAL**: Use admin Supabase client with manual authorization validation
- Validate permissions for every admin operation

### Admin Client Usage Pattern

```typescript
import { isSuperAdmin } from '@portal/admin';
import { getSupabaseServerAdminClient } from '@portal/supabase/server-admin-client';

async function adminOperation() {
  const adminClient = getSupabaseServerAdminClient();

  // CRITICAL: Always validate admin status first
  const currentUser = await getCurrentUser();
  if (!(await isSuperAdmin(currentUser))) {
    throw new Error('Unauthorized: Admin access required');
  }

  // Now safe to proceed with admin privileges
  const { data } = await adminClient.from('accounts').select('*');
  return data;
}
```

## Page Structure Patterns

### Standard Admin Page Template

```typescript
import { AdminGuard } from '@portal/admin/components/admin-guard';
import { PageBody, PageHeader } from '@portal/ui/page';
import { AppBreadcrumbs } from '@portal/ui/app-breadcrumbs';

async function AdminPageComponent() {
  return (
    <>
      <PageHeader description={<AppBreadcrumbs />}>
        {/* Page actions go here */}
      </PageHeader>

      <PageBody>
        {/* Main content */}
      </PageBody>
    </>
  );
}

// ALWAYS wrap with AdminGuard
export default AdminGuard(AdminPageComponent);
```

### Async Server Component Pattern

```typescript
// ✅ CORRECT - Next.js 15 pattern
async function AdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ await params directly

  // Fetch admin data
  const data = await loadAdminData(id);

  return <AdminContent data={data} />;
}
```

## Security Guidelines

### Critical Security Rules

1. **NEVER** expose admin functionality to non-admin users
2. **ALWAYS** validate admin status before operations
3. **NEVER** trust client-side admin checks alone
4. **ALWAYS** use server-side validation for admin actions
5. **NEVER** log sensitive admin data
6. **ALWAYS** audit admin operations

### Admin Action Auditing

```typescript
async function auditedAdminAction(action: string, data: unknown) {
  const logger = await getLogger();

  await logger.info(
    {
      name: 'admin-audit',
      action,
      adminId: currentUser.id,
      timestamp: new Date().toISOString(),
      data: {
        // Log only non-sensitive fields
        operation: action,
        targetId: data.id,
      },
    },
    'Admin action performed',
  );
}
```

## Common Patterns to Follow

1. **Always wrap admin pages with `AdminGuard`**
2. **Use admin client only when RLS bypass is required**
3. **Implement proper error boundaries for admin components**
4. **Add comprehensive logging for admin operations**
5. **Use TypeScript strictly for admin interfaces**
6. **Follow the established admin component naming conventions**
7. **Implement proper loading states for admin operations**
8. **Add proper metadata to admin pages**
