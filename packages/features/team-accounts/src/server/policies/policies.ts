import { allow, definePolicy, deny } from '@portal/policies';
import { createPolicyRegistry } from '@portal/policies';

import { FeaturePolicyInvitationContext } from './feature-policy-invitation-context';

/**
 * Feature-specific registry for invitation policies
 */
export const invitationPolicyRegistry = createPolicyRegistry();

/**
 * Subscription required policy
 * Checks if the account has an active subscription
 */
export const subscriptionRequiredInvitationsPolicy =
  definePolicy<FeaturePolicyInvitationContext>({
    id: 'subscription-required',
    stages: ['preliminary', 'submission'],
    evaluate: async ({ subscription }) => {
      if (!subscription || !subscription.active) {
        return deny({
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'teams:policyErrors.subscriptionRequired',
          remediation: 'teams:policyRemediation.subscriptionRequired',
        });
      }

      return allow();
    },
  });

// register policies below to apply them
//
