import 'server-only';

import { and, eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

import { invitations, usersInAuth } from '../drizzle/schema';

/**
 * Query builders for invitation-related operations
 */

/**
 * Get account invitations with inviter details
 */
export function getAccountInvitations(accountId: string) {
  return {
    select: {
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      inviteToken: invitations.inviteToken,
      createdAt: invitations.createdAt,
      expiresAt: invitations.expiresAt,
      invitedBy: {
        id: usersInAuth.id,
        // Add more user fields as needed
      },
    },
    from: invitations,
    joins: [
      {
        table: usersInAuth,
        on: eq(invitations.invitedBy, usersInAuth.id),
      },
    ],
    where: eq(invitations.accountId, accountId),
  };
}

/**
 * Get valid (non-expired) invitation by token
 */
export function getValidInvitationByToken(token: string) {
  const now = new Date();
  return {
    select: {
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      accountId: invitations.accountId,
      invitedBy: invitations.invitedBy,
      expiresAt: invitations.expiresAt,
    },
    from: invitations,
    where: and(
      eq(invitations.inviteToken, token),
      sql`${invitations.expiresAt} > NOW()`,
    ),
  };
}

/**
 * Get invitation by email and account
 */
export function getInvitationByEmailAndAccount(
  email: string,
  accountId: string,
) {
  return {
    select: {
      id: invitations.id,
      role: invitations.role,
      expiresAt: invitations.expiresAt,
    },
    from: invitations,
    where: and(
      eq(invitations.email, email),
      eq(invitations.accountId, accountId),
    ),
  };
}
