# Feature Packages Instructions


## Feature Package Structure

- `accounts/` - Personal account management
- `admin/` - Super admin functionality  
- `auth/` - Authentication features
- `notifications/` - Notification system
- `team-accounts/` - Team account management

## Account Services

### Personal Accounts API

Located at: `packages/features/accounts/src/server/api.ts`

```typescript
import { createAccountsApi } from '@portal/accounts/api';
import { getSupabaseServerClient } from '@portal/supabase/server-client';

const client = getSupabaseServerClient();
const api = createAccountsApi(client);

// Get account data
const account = await api.getAccount(accountId);

// Get account workspace
const workspace = await api.getAccountWorkspace();

// Load user accounts
const accounts = await api.loadUserAccounts();

// Get subscription
const subscription = await api.getSubscription(accountId);

// Get customer ID
const customerId = await api.getCustomerId(accountId);
```

### Team Accounts API

Located at: `packages/features/team-accounts/src/server/api.ts`

```typescript
import { createTeamAccountsApiDrizzle } from '@portal/team-accounts/api.drizzle';

const api = createTeamAccountsApi(client);

// Get team account by slug
const account = await api.getTeamAccount(slug);

// Get account workspace
const workspace = await api.getAccountWorkspace(slug);

// Check permissions
const hasPermission = await api.hasPermission({
  accountId,
  userId,
});

// Get members count
const count = await api.getMembersCount(accountId);

// Get invitation
const invitation = await api.getInvitation(adminClient, token);
```

## Workspace Contexts

### Personal Account Context

Use in `apps/web/app/home/(user)` routes:

```tsx
import { useUserWorkspace } from 'kit/accounts/hooks/use-user-workspace';

function PersonalComponent() {
  const { user, account } = useUserWorkspace();
  
  // user: authenticated user data
  // account: personal account data
  
  return <div>Welcome {user.name}</div>;
}
```

Context provider: `packages/features/accounts/src/components/user-workspace-context-provider.tsx`

### Team Account Context

Use in `apps/web/app/home/[account]` routes:

```tsx
import { useTeamAccountWorkspace } from '@portal/team-accounts/hooks/use-team-account-workspace';

function TeamComponent() {
  const { account, user, accounts } = useTeamAccountWorkspace();
  
  // account: current team account data
  // user: authenticated user data  
  // accounts: all accounts user has access to
  
  return <div>Team: {account.name}</div>;
}
```

Context provider: `packages/features/team-accounts/src/components/team-account-workspace-context-provider.tsx`




```typescript
// - Manage individual user subscriptions
// - Handle personal account payments
```



```typescript
// - Manage team subscriptions
// - Handle team payments
```



```typescript


// Increase seats when adding team members

// Decrease seats when removing team members  

// Get per-seat subscription item
```

## Authentication Features

### OTP for Sensitive Operations

Use one-time tokens from `packages/otp/src/api/index.ts`:

```tsx
import { VerifyOtpForm } from '@portal/otp/components';

<VerifyOtpForm
  purpose="account-deletion"
  email={user.email}
  onSuccess={(otp) => {
    // Proceed with verified operation
    handleSensitiveOperation(otp);
  }}
  CancelButton={<Button variant="outline">Cancel</Button>}
/>
```

## Admin Features

### Super Admin Protection

For admin routes, use `AdminGuard`:

```tsx
import { AdminGuard } from '@portal/admin/components/admin-guard';

function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}

// Wrap the page component
export default AdminGuard(AdminPage);
```

### Admin Service

Located at: `packages/features/admin/src/lib/server/services/admin.service.ts`

```typescript
// Admin service operations
// - Manage all accounts
// - Handle admin-level operations
// - Access system-wide data
```

### Checking Admin Status

```typescript
import { isSuperAdmin } from '@portal/admin';

function criticalAdminFeature() {
  const isAdmin = await isSuperAdmin(client);

  if (!isAdmin) {
    throw new Error('Access denied: Admin privileges required');
  }

  // ...
}
```

## Error Handling & Logging

### Structured Logging

Use logger from `packages/shared/src/logger/logger.ts`:

```typescript
import { getLogger } from '@portal/shared/logger';

async function featureOperation() {
  const logger = await getLogger();

  const ctx = { 
    name: 'feature-operation', 
    userId: user.id,
    accountId: account.id 
  };

  try {
    logger.info(ctx, 'Starting feature operation');
    
    // Perform operation
    const result = await performOperation();
    
    logger.info({ ...ctx, result }, 'Feature operation completed');
    return result;
  } catch (error) {
    logger.error({ ...ctx, error }, 'Feature operation failed');
    throw error;
  }
}
```

## Permission Patterns

### Team Permissions

```typescript
import { createTeamAccountsApiDrizzle } from '@portal/team-accounts/api.drizzle';

const api = createTeamAccountsApi(client);

// Check if user has specific permission on account
  accountId,
  userId,
});

  throw new Error('Insufficient permissions');
}
```

### Account Ownership

```typescript
// Check if user is account owner (works for both personal and team accounts)
const isOwner = await client.rpc('is_account_owner', { 
  account_id: accountId 
});

if (!isOwner) {
  throw new Error('Only account owners can perform this action');
}
```