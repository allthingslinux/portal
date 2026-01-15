---
name: Fix PR#1 Review Issues
overview: Address all critical security, type safety, and architecture issues identified by CodeRabbit and Sourcery AI reviews for the Sentry/t3-env implementation PR.
todos:
  - id: security-fixes
    content: "Fix critical security issues: remove hardcoded DSN, implement CSP nonces, prevent error leakage"
    status: completed
  - id: type-safety
    content: Update Zod validators for v4, remove type assertions, improve error parsing type guards
    status: completed
  - id: error-handling
    content: Fix error boundary Sentry integration, standardize API responses, guard window access
    status: completed
  - id: architecture
    content: Centralize env access, cache keys(), handle optional SENTRY_RELEASE, merge transpilePackages
    status: completed
  - id: code-quality
    content: Fix lodash imports, image formats, HTTP status constants, JSON stringification, regex patterns
    status: completed
  - id: refactoring
    content: Simplify Sentry initializers, cache/queue/http helpers, scope patterns; use official types
    status: completed
  - id: minor-fixes
    content: Improve JSON-LD escaping, simplify trace filtering, clean up instrumentation, remove redundant code
    status: completed
  - id: documentation
    content: Add docstrings (target 80% coverage) and improve PR description
    status: completed
---

# Fix PR#1 Review Issues

## Critical Security Issues

### 1. Remove Hardcoded Sentry DSN

**Files**: [`.cursor/rules/sentry.mdc`](.cursor/rules/sentry.mdc)

- Replace hardcoded DSN string `https://b8a2d1e96d478cdd0cbedd89f23f33e4@o4506955434885120.ingest.us.sentry.io/4510675394822144` with placeholder
- Update both occurrences to use `process.env.SENTRY_DSN` or `"YOUR_SENTRY_DSN_HERE"`

### 2. Fix CSP Security Headers

**Files**: [`next.config.ts`](next.config.ts), create `middleware.ts`

- Remove `'unsafe-eval'` and `'unsafe-inline'` from CSP
- Implement per-request nonce generation in middleware
- Update CSP to use `'strict-dynamic'` with nonces
- Update [`src/lib/seo/json-ld.tsx`](src/lib/seo/json-ld.tsx) and chart components to use nonce from request context

### 3. Prevent Error Message Leakage in API Responses

**Files**: [`src/lib/api/utils.ts`](src/lib/api/utils.ts)

- Keep detailed error logging for observability
- Return generic "Internal server error" message to clients (not parsed error details)
- Only expose error messages for `APIError` instances that are safe to surface

## Type Safety & Zod v4 Migration

### 4. Update Zod String Validators

**Files**:

- [`src/lib/observability/keys.ts`](src/lib/observability/keys.ts) line 12
- [`src/lib/db/keys.ts`](src/lib/db/keys.ts) line 7
- [`src/lib/auth/keys.ts`](src/lib/auth/keys.ts) line 8

Replace `z.string().url()` with `z.url()` for Zod v4 compatibility

### 5. Fix Type Safety Issues

#### Remove Redundant Type Assertions

**Files**:

- [`src/components/layout/navigation/nav-item.tsx`](src/components/layout/navigation/nav-item.tsx) line 36
- [`src/components/layout/navigation/nav-collapsible.tsx`](src/components/layout/navigation/nav-collapsible.tsx) line 60
- [`src/components/layout/sidebar/sidebar-user-section.tsx`](src/components/layout/sidebar/sidebar-user-section.tsx) lines 84-86
- [`src/components/command-menu.tsx`](src/components/command-menu.tsx) line 56

Fix route path types at source instead of using `as Parameters<typeof Link>[0]["href"]` casts

#### Improve Error Parsing Type Safety

**Files**: [`src/lib/observability/error.ts`](src/lib/observability/error.ts) lines 9-19

```typescript
// Check that message is actually a string
if (
  error &&
  typeof error === "object" &&
  "message" in error &&
  typeof error.message === "string"
) {
  return error.message;
}
```

## Error Handling & Observability Improvements

### 6. Fix Error Boundary Sentry Integration

**Files**:

- [`src/app/error.tsx`](src/app/error.tsx) lines 27-29
- [`src/app/global-error.tsx`](src/app/global-error.tsx) lines 39-43

Replace dynamic `require("@sentry/nextjs")` with static import:

```typescript
import { captureException } from "@sentry/nextjs";
```

Wrap in try-catch to handle cases where Sentry might not be available.

### 7. Standardize API Error Response Shape

**Files**: API route handlers throughout `src/app/api/`

Ensure all error responses use consistent shape:

```typescript
Response.json({ ok: false, error: message }, { status })
```

Replace direct `{ error: "..." }` responses with standardized format via `handleAPIError`.

### 8. Fix Window Access in Server Code

**Files**: [`src/lib/observability/enrichment.ts`](src/lib/observability/enrichment.ts) lines 174-191

Guard `window.location.hostname` access:

```typescript
const hostname = typeof window !== "undefined" ? window.location.hostname : "server";
```

## Architecture & Performance Optimizations

### 9. Centralize Environment Variable Access

**Files**: [`next.config.ts`](next.config.ts), [`src/lib/next-config/with-observability.ts`](src/lib/next-config/with-observability.ts)

- Use `keys()` helper instead of `process.env.NEXT_PUBLIC_SENTRY_DSN` in next.config.ts for CSP reporting
- Use `keys().SENTRY_AUTH_TOKEN` instead of `process.env.SENTRY_AUTH_TOKEN` 
- Add `SENTRY_AUTH_TOKEN` to observability schema if missing
- Cache `keys()` result in module-level constant to avoid recomputing env schema

### 10. Handle Optional SENTRY_RELEASE

**Files**:

- [`src/lib/next-config/with-observability.ts`](src/lib/next-config/with-observability.ts) line 44
- [`src/lib/observability/server.ts`](src/lib/observability/server.ts)
- [`src/lib/observability/edge.ts`](src/lib/observability/edge.ts)
- [`src/lib/observability/client.ts`](src/lib/observability/client.ts) lines 148-150

Provide fallback for undefined `SENTRY_RELEASE`:

```typescript
release: env.SENTRY_RELEASE || 'unknown'
```

Note: Client needs `NEXT_PUBLIC_SENTRY_RELEASE` or should remove release assignment.

### 11. Merge transpilePackages Array

**Files**: [`src/lib/next-config/with-observability.ts`](src/lib/next-config/with-observability.ts) lines 82-88

Preserve existing `transpilePackages`:

```typescript
transpilePackages: [
  ...(sourceConfig.transpilePackages || []),
  "@sentry/nextjs"
].filter((v, i, a) => a.indexOf(v) === i) // unique
```

### 12. Fix Lodash Tree-Shaking

**Files**:

- [`package.json`](package.json) line 88
- [`src/lib/seo/metadata.ts`](src/lib/seo/metadata.ts) line 2

Use specific import for better tree-shaking:

```typescript
import merge from "lodash/merge";
```

Consider using `lodash-es` package instead of full `lodash`.

### 13. Centralize Sentry Access

**Issue**: Scattered `require("@sentry/nextjs")` calls throughout observability utilities

Create a small wrapper module for Sentry SDK access to ease:

- Mocking in tests
- Tree-shaking optimization
- Future SDK upgrades

## Code Quality & Maintainability

### 14. Fix Image Format Configuration

**Files**: [`src/lib/next-config/index.ts`](src/lib/next-config/index.ts) line 5

Use format identifiers instead of MIME types:

```typescript
formats: ["avif", "webp"]
```

### 15. Improve HTTP Status Code Constants

**Files**: [`src/lib/observability/http.ts`](src/lib/observability/http.ts) line 70

Replace magic number with Sentry constant:

```typescript
import { SPAN_STATUS_ERROR } from "@sentry/core";
span.setStatus({ code: SPAN_STATUS_ERROR });
```

### 16. Safe JSON Stringification for Body Size

**Files**: [`src/lib/observability/http.ts`](src/lib/observability/http.ts) lines 88-96

Handle circular/non-serializable bodies:

```typescript
const calculateBodySize = (body: unknown): number | undefined => {
  try {
    return JSON.stringify(body).length;
  } catch {
    return undefined;
  }
};
```

### 17. Fix Regex Case Sensitivity

**Files**: [`src/lib/observability/troubleshooting.ts`](src/lib/observability/troubleshooting.ts) lines 20-25

Update UUID and hash regex to match uppercase hex:

```typescript
.replace(/\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/gi, "/<uuid>")
.replace(/\/[0-9a-fA-F]{40,}/gi, "/<hash>")
```

### 18. Tighten Token Redaction Pattern

**Files**: [`src/lib/observability/troubleshooting.ts`](src/lib/observability/troubleshooting.ts) lines 30-31

Make token pattern more specific to avoid false positives:

```typescript
.replace(/\/[A-Za-z0-9+/=]{40,}/g, "/<token>")  // base64
.replace(/\/[0-9a-fA-F]{32,}/g, "/<token>")     // hex tokens
```

### 19. Refactor Complex Observability Helpers

#### Simplify Sentry Initializers

**Files**: [`src/lib/observability/client.ts`](src/lib/observability/client.ts), [`src/lib/observability/sampling.ts`](src/lib/observability/sampling.ts)

- Extract shared `portalSampler` function from inline tracesSampler
- Extract integration setup into `buildIntegrations()` helper
- Extract env-specific knobs into `buildEnvSamplingConfig()`
- Use `portalSampler` directly in client config instead of duplicating logic

#### Simplify Cache Instrumentation

**Files**: [`src/lib/observability/cache.ts`](src/lib/observability/cache.ts)

- Extract `normalizeKey()` and `baseCacheAttributes()` helpers
- Add optional `withCacheSpan()` wrapper for simple use cases
- Fix cache hit detection for falsy values: `hit ?? (result !== undefined)`

#### Simplify Queue Instrumentation

**Files**: [`src/lib/observability/queue.ts`](src/lib/observability/queue.ts)

- Extract `TraceHeaders` type
- Extract `buildQueueConsumerAttributes()` helper
- Extract `withStatusSpan()` wrapper for try/catch status logic

#### Simplify HTTP Client

**Files**: [`src/lib/observability/http.ts`](src/lib/observability/http.ts)

- Extract `buildOptions()` helper for common option-building
- Centralize method/body → options mapping

#### Simplify Scope Patterns

**Files**: [`src/lib/observability/scopes.ts`](src/lib/observability/scopes.ts)

Change `scopePatterns` to accept work callback:

```typescript
userContext: <T>(user: {...}, fn: () => T): T => 
  withIsolatedScope({ user }, fn)
```

### 20. Use Official Sentry Types

**Files**: [`src/lib/observability/fingerprinting.ts`](src/lib/observability/fingerprinting.ts) lines 66-89

Replace custom interfaces with official types:

```typescript
import type { Event, EventHint } from "@sentry/types";
```

## Minor Quality Improvements

### 21. Improve JSON-LD Escaping Order

**Files**: [`src/lib/seo/json-ld.tsx`](src/lib/seo/json-ld.tsx) lines 12-13

Escape `&` first to avoid double-escaping:

```typescript
.replace(/&/g, "\\u0026")
.replace(/</g, "\\u003c")
.replace(/>/g, "\\u003e")
```

Remove redundant Unicode line separator replacements if not needed.

### 22. Simplify Trace Data Filtering

**Files**: [`src/app/layout.tsx`](src/app/layout.tsx) lines 14-29

```typescript
const validTraceData = Object.fromEntries(
  Object.entries(traceData).filter(([, v]) => v !== undefined)
) as Record<string, string>;
```

### 23. Use createPageMetadata Helper Consistently

**Files**: [`src/app/layout.tsx`](src/app/layout.tsx) lines 31-37

Replace manual spread with `createPageMetadata({ other: validTraceData })` for consistency.

### 24. Clean Up Empty Instrumentation Blocks

**Files**: [`src/instrumentation.ts`](src/instrumentation.ts) lines 18-31

Add explicit TODOs or remove empty conditional blocks for Node.js/Edge runtime instrumentation.

### 25. Remove Redundant Optional Chaining

**Files**: [`src/lib/observability/troubleshooting.ts`](src/lib/observability/troubleshooting.ts)

Remove `?.` after guard clause verifies `span.setAttribute` exists (lines 67-74, 97-99).

### 26. Document Sampling Trade-offs

**Files**: [`src/lib/observability/server.ts`](src/lib/observability/server.ts) lines 163-169

Add comments explaining:

- Cost savings from 10% production sampling
- Impact on rare issue debugging
- Whether critical paths need higher sampling

### 27. Improve CSP URL Parsing Error Handling

**Files**: [`next.config.ts`](next.config.ts) lines 172-177

Add validation for parsed URL components and improve error logging detail.

### 28. Address TODO Comment

**Files**: [`src/lib/routes/i18n.ts`](src/lib/routes/i18n.ts) line 92

Refactor function to reduce cognitive complexity or create tracked issue for the biome-ignore directive.

## Testing & Documentation

### 29. Add Docstrings for Functions

CodeRabbit noted docstring coverage is only 53.33% (threshold: 80%). Add docstrings for:

- All public functions in observability modules
- Key helper functions in new modules
- Exported utilities

### 30. Improve PR Description

Add detailed description explaining:

- Purpose of Sentry integration
- Benefits of t3-env setup
- Instrumentation architecture
- Testing approach

## Summary

This plan addresses:

- **3 critical security vulnerabilities** (hardcoded secrets, CSP bypass, info leakage)
- **5 type safety issues** (Zod v4, type assertions, error parsing)
- **8 architecture problems** (env access, caching, optional values)
- **10 code quality improvements** (tree-shaking, constants, refactoring)
- **4 maintainability fixes** (types, documentation, error handling)

Priority order:

1. Security issues (#1-3) - **MUST FIX BEFORE MERGE**
2. Type safety (#4-5) - **MUST FIX BEFORE MERGE**
3. Critical bugs (#6-8) - **MUST FIX BEFORE MERGE**
4. Architecture improvements (#9-13) - **SHOULD FIX**
5. Code quality (#14-28) - **NICE TO HAVE**
6. Documentation (#29-30) - **SHOULD ADD**