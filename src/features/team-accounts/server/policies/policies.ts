import { allow, definePolicy, deny } from '~/shared/policies';
import { createPolicyRegistry } from '~/shared/policies';

import { FeaturePolicyInvitationContext } from './feature-policy-invitation-context';

/**
 * Feature-specific registry for invitation policies
 */
export const invitationPolicyRegistry = createPolicyRegistry();

// register policies below to apply them
//
