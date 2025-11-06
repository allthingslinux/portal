// Export core types and interfaces
export type { PolicyContext, PolicyResult, PolicyStage } from './types';

// Export primary registry-based API
export { definePolicy } from './declarative';
export type {
  FeaturePolicyDefinition,
  PolicyEvaluator,
  PolicyErrorCode,
  PolicyReason,
} from './declarative';

// Export policy registry (primary API)
export { createPolicyRegistry } from './registry';
export type { PolicyRegistry } from './registry';

// Export evaluator and bridge functions
export {
  createPolicy,
  createPoliciesEvaluator,
  createPolicyFromRegistry,
  createPoliciesFromRegistry,
} from './evaluator';

export type {
  PolicyFunction,
  PolicyGroup,
  EvaluationResult,
} from './evaluator';

// Export helper functions (for policy implementations)
export { allow, deny } from './evaluator';
