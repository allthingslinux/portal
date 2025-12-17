import { createPoliciesEvaluator } from "~/shared/policies";

import type { FeaturePolicyInvitationContext } from "./feature-policy-invitation-context";
import { invitationPolicyRegistry } from "./policies";

/**
 * Creates an invitation evaluator
 */
export function createInvitationsPolicyEvaluator() {
  const evaluator = createPoliciesEvaluator<FeaturePolicyInvitationContext>();

  return {
    /**
     * Checks if there are any invitation policies for the given stage
     * @param stage - The stage to check if there are any invitation policies for
     */
    async hasPoliciesForStage(stage: "preliminary" | "submission") {
      return evaluator.hasPoliciesForStage(invitationPolicyRegistry, stage);
    },

    /**
     * Evaluates the invitation policies for the given context and stage
     * @param context - The context for the invitation policy
     * @param stage - The stage to evaluate the invitation policies for
     * @returns
     */
    async canInvite(
      context: FeaturePolicyInvitationContext,
      stage: "preliminary" | "submission"
    ) {
      return evaluator.evaluate(
        invitationPolicyRegistry,
        context,
        "ALL",
        stage
      );
    },
  };
}
