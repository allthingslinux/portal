import 'server-only';

import { z } from 'zod';

/**
 * @deprecated This service needs to be reimplemented using Supabase Auth REST API
 * or NextAuth admin functionality. For now, it's a placeholder.
 */
export function createAdminAuthUserService() {
  return new AdminAuthUserService();
}

/**
 * @name AdminAuthUserService
 * @description Service for performing admin actions on users in the system.
 * @deprecated Needs reimplementation with REST API or NextAuth
 */
class AdminAuthUserService {

  /**
   * Delete a user by deleting the user record and auth record.
   * @param userId
   * @deprecated Needs reimplementation
   */
  async deleteUser(userId: string) {
    // TODO: Implement using Supabase Auth REST API
    throw new Error('deleteUser needs to be reimplemented with REST API');
  }

  /**
   * Ban a user by setting the ban duration to `876600h` (100 years).
   * @param userId
   * @deprecated Needs reimplementation
   */
  async banUser(userId: string) {
    // TODO: Implement using Supabase Auth REST API
    throw new Error('banUser needs to be reimplemented with REST API');
  }

  /**
   * Reactivate a user by setting the ban duration to `none`.
   * @param userId
   * @deprecated Needs reimplementation
   */
  async reactivateUser(userId: string) {
    // TODO: Implement using Supabase Auth REST API
    throw new Error('reactivateUser needs to be reimplemented with REST API');
  }

  /**
   * Impersonate a user by generating a magic link and returning the access and refresh tokens.
   * @param userId
   * @deprecated Needs reimplementation
   */
  async impersonateUser(userId: string) {
    // TODO: Implement using Supabase Auth REST API or NextAuth
    throw new Error('impersonateUser needs to be reimplemented');
  }

  /**
   * Assert that the target user is not the current user.
   * @param targetUserId
   * @deprecated Needs reimplementation
   */
  private async assertUserIsNotCurrentSuperAdmin(targetUserId: string) {
    // TODO: Implement using NextAuth session
    throw new Error('assertUserIsNotCurrentSuperAdmin needs to be reimplemented');
  }

  /**
   * @deprecated Needs reimplementation
   */
  private async setBanDuration(userId: string, banDuration: string) {
    // TODO: Implement using Supabase Auth REST API
    throw new Error('setBanDuration needs to be reimplemented');
  }

  /**
   * Reset a user's password by sending a password reset email.
   * @param userId
   * @deprecated Needs reimplementation
   */
  async resetPassword(userId: string) {
    // TODO: Implement using Supabase Auth REST API or NextAuth
    throw new Error('resetPassword needs to be reimplemented');
  }
}
