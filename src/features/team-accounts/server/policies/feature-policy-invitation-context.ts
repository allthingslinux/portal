import type { PolicyContext, PolicyResult } from "~/shared/policies";

/**
 * Invitation policy context that extends the base PolicyContext
 * from '~packages/policies for invitation-specific data.
 */
export interface FeaturePolicyInvitationContext extends PolicyContext {
  /** The account slug being invited to */
  accountSlug: string;

  /** The account ID being invited to (same as accountId from base) */
  accountId: string;

  /** Current subscription data for the account (not used - billing removed) */
  subscription?: {
    id: string;
    status: string;
    active: boolean;
    trial_starts_at?: string;
    trial_ends_at?: string;
    items: Array<{
      id: string;
      type: string;
      quantity: number;
      product_id: string;
      variant_id: string;
    }>;
  };

  /** Current number of members in the account */
  currentMemberCount: number;

  /** The invitations being attempted */
  invitations: Array<{
    email: string;
    role: string;
  }>;

  /** The user performing the invitation */
  invitingUser: {
    id: string;
    email?: string;
  };
}

/**
 * Invitation policy result that extends the base PolicyResult
 * from '~packages/policies while maintaining backward compatibility.
 */
export interface FeaturePolicyInvitationResult extends PolicyResult {
  /** Whether the invitations are allowed */
  allowed: boolean;

  /** Human-readable reason if not allowed */
  reason?: string;

  /** Additional metadata for logging/debugging */
  metadata?: Record<string, unknown>;
}
