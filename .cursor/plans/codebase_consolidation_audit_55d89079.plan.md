---
name: Codebase Consolidation Audit
overview: "Audit identified multiple consolidation opportunities to simplify the codebase: merge duplicate image upload components, consolidate team account server actions, migrate deprecated hooks, unify workspace hooks/loaders, and better organize utility files."
todos:
  - id: merge-image-upload-components
    content: Create shared AccountImageUploader component to replace duplicate UpdateAccountImageContainer and UpdateTeamAccountImageContainer
    status: completed
  - id: consolidate-team-actions
    content: Merge 7 team account server action files into 3 logical files (account CRUD, members, invitations)
    status: completed
  - id: migrate-useuser-hook
    content: Replace all 9 instances of deprecated useUser() with useSession() from NextAuth hooks
    status: completed
  - id: unify-workspace-hooks
    content: Create shared useWorkspaceContext generic hook to replace useUserWorkspace and useTeamAccountWorkspace
    status: completed
  - id: consolidate-workspace-loaders
    content: Extract common loader utilities to reduce duplication between loadUserWorkspace and loadTeamWorkspace
    status: completed
  - id: extract-action-patterns
    content: Create shared revalidation and permission check utilities for server actions
    status: completed
  - id: organize-utils
    content: Add clear documentation to utility files explaining their purpose and organization
    status: completed
  - id: unify-account-updates
    content: Create shared account update utilities to reduce duplication between personal and team account update actions
    status: completed
---

# Codebase Consolidation Plan

## Overview

This plan consolidates duplicate code, merges similar patterns, and simplifies the codebase structure to make it easier for developers to navigate and maintain.

## Key Consolidation Opportunities

### 1. Merge Duplicate Image Upload Components

**Files:**

- `src/features/accounts/components/personal-account-settings/update-account-image-container.tsx`
- `src/features/team-accounts/components/settings/update-team-account-image-container.tsx`

**Issue:** These two files are ~90% identical with only minor differences (action name, translation keys, callback handling).

**Solution:** Create a shared `AccountImageUploader` component that accepts:

- `accountId: string`
- `pictureUrl: string | null`
- `onUpdate: (pictureUrl: string | null) => Promise<void>`
- `translationNamespace: 'account' | 'teams'`
- `onSuccess?: () => void` (for personal account revalidation)

### 2. Consolidate Team Account Server Actions

**Files:**

- `src/features/team-accounts/server/actions/team-account-server-actions.ts` (1 action)
- `src/features/team-accounts/server/actions/team-details-server-actions.ts` (1 action)
- `src/features/team-accounts/server/actions/team-members-server-actions.ts` (3 actions)
- `src/features/team-accounts/server/actions/team-invitations-server-actions.ts` (5 actions)
- `src/features/team-accounts/server/actions/create-team-account-server-actions.ts` (1 action)
- `src/features/team-accounts/server/actions/delete-team-account-server-actions.ts` (1 action)
- `src/features/team-accounts/server/actions/leave-team-account-server-actions.ts` (1 action)

**Issue:** 7 separate files with only 13 total actions. Personal accounts has all actions in one file (`personal-accounts-server-actions.ts`).

**Solution:** Consolidate into 3 logical files:

- `team-account-server-actions.ts` - Account CRUD (create, update picture, update name, delete, leave)
- `team-members-server-actions.ts` - Member management (remove, update role, transfer ownership)
- `team-invitations-server-actions.ts` - Invitation management (create, delete, update, accept, renew)

### 3. Migrate Deprecated useUser Hook

**Files using deprecated `useUser`:**

- `src/features/team-accounts/components/members/transfer-ownership-dialog.tsx`
- `src/features/team-accounts/components/settings/team-account-danger-zone.tsx`
- `src/features/accounts/components/personal-account-settings/account-danger-zone.tsx`
- `src/shared/components/personal-account-dropdown-container.tsx`
- `src/app/error.tsx`
- `src/app/global-error.tsx`
- `src/features/accounts/components/personal-account-settings/email/update-email-form-container.tsx`
- `src/features/accounts/components/personal-account-settings/link-accounts/link-accounts-list.tsx`
- `src/features/accounts/components/personal-account-settings/password/update-password-container.tsx`

**Issue:** `useUser` is deprecated (wraps `useSession`) but still used in 9 files.

**Solution:** Replace all `useUser()` calls with `useSession()` from `~/core/auth/nextauth/hooks`. The API is compatible:

- `useUser().data` → `useSession().data`
- `useUser().isLoading` → `useSession().isLoading`
- `useUser().refetch()` → Not needed (NextAuth handles automatically)

### 4. Unify Workspace Hooks Pattern

**Files:**

- `src/features/accounts/hooks/use-user-workspace.ts`
- `src/features/team-accounts/hooks/use-team-account-workspace.ts`

**Issue:** Both hooks follow identical patterns (context check, error message) but are separate.

**Solution:** Create a shared `useWorkspaceContext<T>` generic hook:

```typescript
function useWorkspaceContext<T>(
  context: React.Context<T | null>,
  errorMessage: string
): T
```

### 5. Consolidate Workspace Loaders

**Files:**

- `src/app/home/(user)/_lib/server/load-user-workspace.ts`
- `src/app/home/[account]/_lib/server/team-account-workspace.loader.ts`

**Issue:** Both follow similar patterns (cache, Promise.all, requireUserInServerComponent).

**Solution:** Extract common loader utilities:

- Shared `createWorkspaceLoader` helper that handles:
  - Caching pattern
  - User requirement
  - Error handling
  - Type safety

### 6. Organize Utility Files

**Files:**

- `src/shared/utils.ts` - `isBrowser()`, `formatCurrency()`
- `src/shared/components/lib/utils.ts` - `cn()`, route utilities

**Issue:** Utilities are split across two files with unclear organization.

**Solution:** Better organize:

- Keep `src/shared/utils.ts` for general utilities (`isBrowser`, `formatCurrency`)
- Keep `src/shared/components/lib/utils.ts` for UI/component utilities (`cn`, route helpers)
- Add clear JSDoc comments explaining the split

### 7. Extract Common Action Patterns

**Files:**

- Multiple server action files using similar patterns

**Issue:** Repeated patterns for:

- Revalidation helpers (`revalidateMemberPage()`, etc.)
- Permission checks
- Error handling

**Solution:** Create shared utilities in `src/shared/next/actions/`:

- `revalidate-account-paths.ts` - Common revalidation helpers
- `action-helpers.ts` - Permission check utilities

### 8. Unify Account Update Actions

**Files:**

- `src/features/accounts/server/personal-accounts-server-actions.ts` - `updateAccountPictureUrlAction`, `updateAccountDataAction`
- `src/features/team-accounts/server/actions/team-account-server-actions.ts` - `updateTeamAccountPictureUrlAction`
- `src/features/team-accounts/server/actions/team-details-server-actions.ts` - `updateTeamAccountName`

**Issue:** Similar update patterns but different implementations.

**Solution:** Create shared account update utilities that both can use, reducing duplication in the update logic.

## Implementation Priority

1. **High Priority** (High impact, low risk):

   - Merge duplicate image upload components (#1)
   - Consolidate team account server actions (#2)
   - Migrate deprecated useUser hook (#3)

2. **Medium Priority** (Medium impact, low risk):

   - Unify workspace hooks (#4)
   - Consolidate workspace loaders (#5)
   - Extract common action patterns (#7)

3. **Low Priority** (Low impact, organizational):

   - Organize utility files (#6)
   - Unify account update actions (#8)

## Notes

- All changes maintain backward compatibility where possible
- No breaking changes to public APIs
- Focus on reducing duplication while maintaining clarity
- Keep related functionality together (cohesion over separation)