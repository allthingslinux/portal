# FeaturePolicy API - Registry-Based Policy System

A unified, registry-based foundation for implementing business rules across all Portal features.

## Overview

The FeaturePolicy API provides:

- **Registry-based architecture** - centralized policy management with IDs
- **Configuration support** - policies can accept typed configuration objects
- **Stage-aware evaluation** - policies can be filtered by execution stage
- **Immutable contexts** for safe policy evaluation
- **Customer extensibility** - easy to add custom policies without forking

## Quick Start

### 1. Register Policies

```typescript
import { z } from 'zod';

import {
  allow,
  createPolicyRegistry,
  definePolicy,
  deny,
} from '@portal/policies';

const registry = createPolicyRegistry();

// Register a basic policy
registry.registerPolicy(
  definePolicy({
    id: 'email-validation',
    stages: ['preliminary', 'submission'],
    evaluate: async (context) => {
      if (!context.userEmail?.includes('@')) {
        return deny({
          code: 'INVALID_EMAIL_FORMAT',
          message: 'Invalid email format',
          remediation: 'Please provide a valid email address',
        });
      }
      return allow();
    },
  }),
);

// Register a configurable policy
registry.registerPolicy(
  definePolicy({
    id: 'max-invitations',
    configSchema: z.object({
      maxInvitations: z.number().positive(),
    }),
    evaluate: async (context, config = { maxInvitations: 5 }) => {
      if (context.invitations.length > config.maxInvitations) {
        return deny({
          code: 'MAX_INVITATIONS_EXCEEDED',
          message: `Cannot invite more than ${config.maxInvitations} members`,
          remediation: `Reduce invitations to ${config.maxInvitations} or fewer`,
        });
      }
      return allow();
    },
  }),
);
```

### 2. Use Policies from Registry

```typescript
import {
  createPoliciesFromRegistry,
  createPolicyEvaluator,
  createPolicyRegistry,
} from '@portal/policies';

const registry = createPolicyRegistry();

// Load policies from registry
const policies = await createPoliciesFromRegistry(registry, [
  'email-validation',
  'subscription-required',
  ['max-invitations', { maxInvitations: 5 }], // with configuration
]);

const evaluator = createPolicyEvaluator();
const result = await evaluator.evaluatePolicies(policies, context, 'ALL');

if (!result.allowed) {
  console.log('Failed reasons:', result.reasons);
}
```

### 3. Group Policies with Complex Logic

```typescript
// Basic group example
const preliminaryGroup = {
  operator: 'ALL' as const,
  policies: [emailValidationPolicy, authenticationPolicy],
};

// Evaluate groups in sequence
const result = await evaluator.evaluateGroups(
  [preliminaryGroup],
  context,
);
```

## Complex Group Flows

### Real-World Multi-Stage Team Invitation Flow

```typescript
import { createPolicy, createPolicyEvaluator } from '@portal/policies';

// Complex business logic: (Authentication AND Email Validation) AND Feature Limits
async function validateTeamInvitation(context: InvitationContext) {
  const evaluator = createPolicyEvaluator();

  // Stage 1: Authentication Requirements (ALL must pass)
  const authenticationGroup = {
    operator: 'ALL' as const,
    policies: [
      createPolicy(async (ctx) =>
        ctx.userId
          ? allow({ step: 'authenticated' })
          : deny('Authentication required'),
      ),
      createPolicy(async (ctx) =>
        ctx.email.includes('@')
          ? allow({ step: 'email-valid' })
          : deny('Valid email required'),
      ),
      createPolicy(async (ctx) =>
        ctx.permissions.includes('invite')
          ? allow({ step: 'permissions' })
          : deny('Insufficient permissions'),
      ),
    ],
  };

  // Stage 2: Feature Access Validation (ANY sufficient)
  const featureAccessGroup = {
    operator: 'ANY' as const,
    policies: [
      createPolicy(async (ctx) =>
        ctx.user.role === 'admin'
          ? allow({ access: 'admin' })
          : deny('Admin access required'),
      ),
      createPolicy(async (ctx) =>
        ctx.user.features.includes('team-invitations')
          ? allow({ access: 'feature-enabled' })
          : deny('Team invitations feature not enabled'),
      ),
      createPolicy(async (ctx) =>
        ctx.user.accountAge > 30 // days
          ? allow({ access: 'established-user' })
          : deny('Account must be at least 30 days old'),
      ),
    ],
  };

  // Stage 3: Final Constraints (ALL must pass)
  const constraintsGroup = {
    operator: 'ALL' as const,
    policies: [
      createPolicy(async (ctx) =>
        ctx.team.memberCount < 50
          ? allow({ constraint: 'member-limit' })
          : deny('Team cannot have more than 50 members'),
      ),
      createPolicy(async (ctx) =>
        ctx.invitations.length <= 10
          ? allow({ constraint: 'batch-size' })
          : deny('Cannot invite more than 10 members at once'),
      ),
    ],
  };

  // Execute all groups sequentially - ALL groups must pass
  const result = await evaluator.evaluateGroups(
    [authenticationGroup, featureAccessGroup, constraintsGroup],
    context,
  );

  return {
    allowed: result.allowed,
    reasons: result.reasons,
    metadata: {
      stagesCompleted: result.results.length,
      authenticationPassed: result.results.some(
        (r) => r.metadata?.step === 'authenticated',
      ),
      accessType: result.results.find((r) => r.metadata?.access)?.metadata
        ?.access,
      constraintsChecked: result.results.some((r) => r.metadata?.constraint),
    },
  };
}
```

### Middleware-Style Policy Chain

```typescript
// Simulate middleware pattern: Auth → Rate Limiting → Business Logic
async function processApiRequest(context: ApiContext) {
  const evaluator = createPoliciesEvaluator();

  // Layer 1: Security (ALL required)
  const securityLayer = {
    operator: 'ALL' as const,
    policies: [
      createPolicy(async (ctx) =>
        ctx.apiKey && ctx.apiKey.length > 0
          ? allow({ security: 'api-key-valid' })
          : deny('API key required'),
      ),
      createPolicy(async (ctx) =>
        ctx.rateLimitRemaining > 0
          ? allow({ security: 'rate-limit-ok' })
          : deny('Rate limit exceeded'),
      ),
      createPolicy(async (ctx) =>
        !ctx.blacklisted
          ? allow({ security: 'not-blacklisted' })
          : deny('Client is blacklisted'),
      ),
    ],
  };

  // Layer 2: Authorization (ANY sufficient - flexible access levels)
  const authorizationLayer = {
    operator: 'ANY' as const,
    policies: [
      createPolicy(async (ctx) =>
        ctx.user.role === 'admin'
          ? allow({ access: 'admin' })
          : deny('Admin access denied'),
      ),
      createPolicy(async (ctx) =>
        ctx.user.permissions.includes(ctx.requestedResource)
          ? allow({ access: 'resource-specific' })
          : deny('Resource access denied'),
      ),
      createPolicy(async (ctx) =>
        ctx.user.features?.includes('api-access')
          ? allow({ access: 'feature-based' })
          : deny('Feature access denied'),
      ),
    ],
  };

  // Layer 3: Business Rules (ALL required)
  const businessLayer = {
    operator: 'ALL' as const,
    policies: [
      createPolicy(async (ctx) =>
        ctx.request.size <= ctx.maxRequestSize
          ? allow({ business: 'size-valid' })
          : deny('Request too large'),
      ),
      createPolicy(async (ctx) =>
        ctx.user.dailyQuota > ctx.user.dailyUsage
          ? allow({ business: 'quota-available' })
          : deny('Daily quota exceeded'),
      ),
    ],
  };

  return evaluator.evaluateGroups(
    [securityLayer, authorizationLayer, businessLayer],
    context,
  );
}
```

### Complex Nested Logic with Short-Circuiting

```typescript
// Complex scenario: (Premium User OR (Basic User AND Low Usage)) AND Security Checks
async function validateFeatureAccess(context: FeatureContext) {
  const evaluator = createPoliciesEvaluator();

  // Group 1: User Tier Logic - demonstrates complex OR conditions
  const userTierGroup = {
    operator: 'ANY' as const,
    policies: [
      // Premium users get immediate access
      createPolicy(async (ctx) =>
        ctx.user.plan === 'premium'
          ? allow({ tier: 'premium', reason: 'premium-user' })
          : deny('Not premium user'),
      ),
      // Enterprise users get immediate access
      createPolicy(async (ctx) =>
        ctx.user.plan === 'enterprise'
          ? allow({ tier: 'enterprise', reason: 'enterprise-user' })
          : deny('Not enterprise user'),
      ),
      // Basic users need additional validation (sub-group logic)
      createPolicy(async (ctx) => {
        if (ctx.user.plan !== 'basic') {
          return deny('Not basic user');
        }

        // Simulate nested AND logic for basic users
        const basicUserRequirements = [
          ctx.user.monthlyUsage < 1000,
          ctx.user.accountAge > 30, // days
          !ctx.user.hasViolations,
        ];

        const allBasicRequirementsMet = basicUserRequirements.every(
          (req) => req,
        );

        return allBasicRequirementsMet
          ? allow({ tier: 'basic', reason: 'low-usage-basic-user' })
          : deny('Basic user requirements not met');
      }),
    ],
  };

  // Group 2: Security Requirements (ALL must pass)
  const securityGroup = {
    operator: 'ALL' as const,
    policies: [
      createPolicy(async (ctx) =>
        ctx.user.emailVerified
          ? allow({ security: 'email-verified' })
          : deny('Email verification required'),
      ),
      createPolicy(async (ctx) =>
        ctx.user.twoFactorEnabled || ctx.user.plan === 'basic'
          ? allow({ security: '2fa-compliant' })
          : deny('Two-factor authentication required for premium plans'),
      ),
      createPolicy(async (ctx) =>
        !ctx.user.suspiciousActivity
          ? allow({ security: 'activity-clean' })
          : deny('Suspicious activity detected'),
      ),
    ],
  };

  return evaluator.evaluateGroups([userTierGroup, securityGroup], context);
}
```

### Dynamic Policy Composition

```typescript
// Dynamically compose policies based on context
async function createContextAwarePolicyFlow(context: DynamicContext) {
  const evaluator = createPoliciesEvaluator();
  const groups = [];

  // Always include base security
  const baseSecurityGroup = {
    operator: 'ALL' as const,
    policies: [
      createPolicy(async (ctx) =>
        ctx.isAuthenticated ? allow() : deny('Authentication required'),
      ),
    ],
  };
  groups.push(baseSecurityGroup);

  // Add user-type specific policies
  if (context.user.type === 'admin') {
    const adminGroup = {
      operator: 'ALL' as const,
      policies: [
        createPolicy(async (ctx) =>
          ctx.user.adminLevel >= ctx.requiredAdminLevel
            ? allow({ admin: 'level-sufficient' })
            : deny('Insufficient admin level'),
        ),
        createPolicy(async (ctx) =>
          ctx.user.lastLogin > Date.now() - 24 * 60 * 60 * 1000 // 24 hours
            ? allow({ admin: 'recent-login' })
            : deny('Admin must have logged in within 24 hours'),
        ),
      ],
    };
    groups.push(adminGroup);
  }

  // Add feature-specific policies based on requested feature
  if (context.feature.requiresPremium) {
    const premiumGroup = {
      operator: 'ANY' as const,
      policies: [
        createPolicy(async (ctx) =>
          ctx.user.plan === 'premium'
            ? allow({ access: 'premium' })
            : deny('Premium plan required'),
        ),
        createPolicy(async (ctx) =>
          ctx.user.credits && ctx.user.credits > ctx.feature.creditCost
            ? allow({ access: 'credits' })
            : deny('Insufficient credits'),
        ),
      ],
    };
    groups.push(premiumGroup);
  }

  // Add rate limiting for high-impact features
  if (context.feature.highImpact) {
    const rateLimitGroup = {
      operator: 'ALL' as const,
      policies: [
        createPolicy(async (ctx) =>
          ctx.rateLimit.remaining > 0
            ? allow({ rateLimit: 'within-limits' })
            : deny('Rate limit exceeded for high-impact features'),
        ),
      ],
    };
    groups.push(rateLimitGroup);
  }

  return evaluator.evaluateGroups(groups, context);
}
```

### Performance-Optimized Large Group Evaluation

```typescript
// Handle large numbers of policies efficiently
async function validateComplexBusinessRules(context: BusinessContext) {
  const evaluator = createPoliciesEvaluator({ maxCacheSize: 200 });

  // Group policies by evaluation cost and criticality
  const criticalFastGroup = {
    operator: 'ALL' as const,
    policies: [
      // Fast critical checks first
      createPolicy(async (ctx) =>
        ctx.isActive ? allow() : deny('Account inactive'),
      ),
      createPolicy(async (ctx) =>
        ctx.hasPermission ? allow() : deny('No permission'),
      ),
      createPolicy(async (ctx) =>
        !ctx.isBlocked ? allow() : deny('Account blocked'),
      ),
    ],
  };

  const businessLogicGroup = {
    operator: 'ANY' as const,
    policies: [
      // Complex business rules
      createPolicy(async (ctx) => {
        // Simulate complex calculation
        const score = await calculateRiskScore(ctx);
        return score < 0.8
          ? allow({ risk: 'low' })
          : deny('High risk detected');
      }),
      createPolicy(async (ctx) => {
        // Simulate external API call
        const verification = await verifyWithThirdParty(ctx);
        return verification.success
          ? allow({ external: 'verified' })
          : deny('External verification failed');
      }),
    ],
  };

  const finalValidationGroup = {
    operator: 'ALL' as const,
    policies: [
      // Final checks after complex logic
      createPolicy(async (ctx) =>
        ctx.complianceCheck ? allow() : deny('Compliance check failed'),
      ),
    ],
  };

  // Use staged evaluation for better performance
  const startTime = Date.now();

  const result = await evaluator.evaluateGroups(
    [
      criticalFastGroup, // Fast critical checks first
      businessLogicGroup, // Complex logic only if critical checks pass
      finalValidationGroup, // Final validation
    ],
    context,
  );

  const evaluationTime = Date.now() - startTime;

  return {
    ...result,
    performance: {
      evaluationTimeMs: evaluationTime,
      groupsEvaluated: result.results.length > 0 ? 3 : 1,
    },
  };
}

// Helper functions for complex examples
async function calculateRiskScore(context: any): Promise<number> {
  // Simulate complex risk calculation
  await new Promise((resolve) => setTimeout(resolve, 10));
  return Math.random();
}

async function verifyWithThirdParty(
  context: any,
): Promise<{ success: boolean }> {
  // Simulate external API call
  await new Promise((resolve) => setTimeout(resolve, 5));
  return { success: Math.random() > 0.2 };
}
```

## Advanced Usage

### Configurable Policies

```typescript
// Create policy factories for configuration
const createMaxInvitationsPolicy = (maxInvitations: number) =>
  createPolicy(async (context) => {
    if (context.invitations.length > maxInvitations) {
      return deny({
        code: 'MAX_INVITATIONS_EXCEEDED',
        message: `Cannot invite more than ${maxInvitations} members`,
        remediation: `Reduce invitations to ${maxInvitations} or fewer`,
      });
    }
    return allow();
  });

// Use with different configurations
const strictPolicy = createMaxInvitationsPolicy(1);
const standardPolicy = createMaxInvitationsPolicy(5);
const permissivePolicy = createMaxInvitationsPolicy(25);
```

### Feature-Specific evaluators

```typescript
// Create feature-specific evaluator with preset configurations
export function createInvitationevaluator(
  preset: 'strict' | 'standard' | 'permissive',
) {
  const configs = {
    strict: { maxInvitationsPerBatch: 1 },
    standard: { maxInvitationsPerBatch: 5 },
    permissive: { maxInvitationsPerBatch: 25 },
  };

  const config = configs[preset];

  return {
    async validateInvitations(context: InvitationContext) {
      const policies = [
        emailValidationPolicy,
        createMaxInvitationsPolicy(config.maxInvitationsPerBatch),
        subscriptionRequiredPolicy,
        paddleBillingPolicy,
      ];

      const evaluator = createPoliciesEvaluator();
      return evaluator.evaluatePolicies(policies, context, 'ALL');
    },
  };
}

// Usage
const evaluator = createInvitationevaluator('standard');
const result = await evaluator.validateInvitations(context);
```

### Error Handling

```typescript
const result = await evaluator.evaluate();

if (!result.allowed) {
  result.reasons.forEach((reason) => {
    console.log(`Policy ${reason.policyId} failed:`);
    console.log(`  Code: ${reason.code}`);
    console.log(`  Message: ${reason.message}`);
    if (reason.remediation) {
      console.log(`  Fix: ${reason.remediation}`);
    }
  });
}
```

### 1. Register Complex Policy with Configuration

```typescript
import { createPolicyRegistry, definePolicy } from '@portal/policies';

const registry = createPolicyRegistry();

const customConfigurablePolicy = definePolicy({
  id: 'custom-domain-check',
  configSchema: z.object({
    allowedDomains: z.array(z.string()),
    strictMode: z.boolean(),
  }),
  evaluate: async (context, config) => {
    const emailDomain = context.userEmail?.split('@')[1];

    if (config?.strictMode && !config.allowedDomains.includes(emailDomain)) {
      return deny({
        code: 'DOMAIN_NOT_ALLOWED',
        message: `Email domain ${emailDomain} is not in the allowed list`,
        remediation: 'Use an email from an approved domain',
      });
    }

    return allow();
  },
});

registry.registerPolicy(customConfigurablePolicy);
```

## Key Concepts

### Group Operators

- **`ALL` (AND logic)**: All policies in the group must pass
  - **Short-circuits on first failure** for performance
  - Use for mandatory requirements where every condition must be met
  - Example: Authentication AND permissions AND rate limiting

- **`ANY` (OR logic)**: At least one policy in the group must pass
  - **Short-circuits on first success** for performance
  - Use for flexible requirements where multiple options are acceptable
  - Example: Premium subscription OR trial access OR admin override

### Group Evaluation Flow

1. **Sequential Group Processing**: Groups are evaluated in order
2. **All Groups Must Pass**: If any group fails, entire evaluation fails
3. **Short-Circuiting**: Stops on first group failure for performance
4. **Metadata Preservation**: All policy results and metadata are collected

### Performance Considerations

- **Order groups by criticality**: Put fast, critical checks first
- **Use caching**: Configure `maxCacheSize` for frequently used policies
- **Group by evaluation cost**: Separate expensive operations
- **Monitor evaluation time**: Track performance for optimization

## Stage-Aware Evaluation

Policies can be filtered by execution stage. This is useful for running a subset of policies depending on the situation:

```typescript
// Only run preliminary checks
const prelimResult = await evaluator.evaluate(
  registry,
  context,
  'ALL',
  'preliminary',
);

// Run submission validation
const submitResult = await evaluator.evaluate(
  registry,
  context,
  'ALL',
  'submission',
);

// Run all applicable policies
const fullResult = await evaluator.evaluate(registry, context, 'ALL');
```
