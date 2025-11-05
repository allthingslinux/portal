import 'server-only';

import { eq } from 'drizzle-orm';

import { accounts, usersInAuth } from '../drizzle/schema';

/**
 * Query builders for authentication and authorization operations
 */

/**
 * Check if user is account owner
 * Equivalent to is_account_owner RPC function
 */
export function isAccountOwner(_accountId: string, userId: string) {
  return {
    select: { count: true },
    from: accounts,
    where: eq(accounts.primaryOwnerUserId, userId),
  };
}

/**
 * Check if user can perform action on account member
 * Equivalent to can_action_account_member RPC function
 */
export function canActionAccountMember(
  _targetAccountId: string,
  _targetUserId: string,
  _currentUserId: string,
) {
  // This is a complex permission check that would need to be implemented
  // based on your specific role hierarchy and permission logic
  // For now, this is a placeholder - you'd need to implement the actual logic
  return {
    select: { canAction: true },
    from: accounts,
    where: eq(accounts.id, _targetAccountId),
  };
}

/**
 * Get user by ID from auth.users
 */
export function getUserById(userId: string) {
  return {
    select: {
      id: usersInAuth.id,
      // Add other user fields as needed based on your schema
    },
    from: usersInAuth,
    where: eq(usersInAuth.id, userId),
  };
}
