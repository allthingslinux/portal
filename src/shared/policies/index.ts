// Export core types and interfaces

export type {
  FeaturePolicyDefinition,
  PolicyErrorCode,
  PolicyEvaluator,
  PolicyReason,
} from "./declarative";

// Export primary registry-based API
export { definePolicy } from "./declarative";
export type {
  EvaluationResult,
  PolicyFunction,
  PolicyGroup,
} from "./evaluator";
// Export evaluator and bridge functions
// Export helper functions (for policy implementations)
export {
  allow,
  createPoliciesEvaluator,
  createPoliciesFromRegistry,
  createPolicy,
  createPolicyFromRegistry,
  deny,
} from "./evaluator";
export type { PolicyRegistry } from "./registry";
// Export policy registry (primary API)
export { createPolicyRegistry } from "./registry";
export type { PolicyContext, PolicyResult, PolicyStage } from "./types";
