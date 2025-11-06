/**
 * Base context interface that all policy contexts must extend.
 * Provides common metadata and identifiers used across all policy types.
 */
export interface PolicyContext {
  /** Timestamp when the policy evaluation was initiated */
  timestamp: string;

  /** Additional metadata for debugging and logging */
  metadata?: Record<string, unknown>;
}

/**
 * Standard result interface returned by all policy evaluations.
 * Provides consistent structure for policy decisions across all features.
 */
export interface PolicyResult {
  /** Whether the action is allowed by this policy */
  allowed: boolean;

  /** Human-readable reason when action is not allowed */
  reason?: string;

  /** Whether this policy failure requires manual review */
  requiresManualReview?: boolean;

  /** Additional metadata for debugging, logging, and UI customization */
  metadata?: Record<string, unknown>;
}

/**
 * Policy evaluation stages are user-defined strings for multi-phase validation.
 * Allows policies to run at different points in the user workflow.
 *
 * Common examples:
 * - 'preliminary' - runs before user input/form submission
 * - 'submission' - runs during form submission with actual user data
 * - 'post_action' - runs after the action has been completed
 *
 * You can define your own stages like 'validation', 'authorization', 'audit', etc.
 */
export type PolicyStage = string;
