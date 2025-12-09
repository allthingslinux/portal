import "server-only";

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
  async deleteUser(_userId: string) {
    // TODO: Implement using Supabase Auth REST API
    throw new Error("deleteUser needs to be reimplemented with REST API");
  }

  /**
   * Ban a user by setting the ban duration to `876600h` (100 years).
   * @param userId
   * @deprecated Needs reimplementation
   */
  async banUser(_userId: string) {
    // TODO: Implement using Supabase Auth REST API
    throw new Error("banUser needs to be reimplemented with REST API");
  }

  /**
   * Reactivate a user by setting the ban duration to `none`.
   * @param userId
   * @deprecated Needs reimplementation
   */
  async reactivateUser(_userId: string) {
    // TODO: Implement using Supabase Auth REST API
    throw new Error("reactivateUser needs to be reimplemented with REST API");
  }

  /**
   * Impersonate a user (not implemented). Requires dedicated auth provider support.
   * @param userId
   * @deprecated Needs reimplementation
   */
  async impersonateUser(_userId: string) {
    // TODO: Implement using Supabase Auth REST API
    throw new Error("impersonateUser needs to be reimplemented");
  }

  /**
   * Reset a user's password by sending a password reset email.
   * @param userId
   * @deprecated Needs reimplementation
   */
  async resetPassword(_userId: string) {
    // TODO: Implement using Supabase Auth REST API or NextAuth
    throw new Error("resetPassword needs to be reimplemented");
  }
}
