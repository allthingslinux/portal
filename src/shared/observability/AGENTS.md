# src/shared/observability

> Scope: Error tracking (Sentry), OpenTelemetry tracing, web vitals, and structured logging.

## What Lives Here

| File | Purpose |
|------|---------|
| `client.ts` | Sentry browser SDK init and client-side instrumentation |
| `server.ts` | Sentry Node SDK init, server-side spans, and log patterns |
| `edge.ts` | Sentry Edge runtime init |
| `helpers.ts` | Custom span helpers, breadcrumb utilities, error capture wrappers |
| `wide-events.ts` | Wide event / structured log schema definitions |
| `utils.ts` | Shared observability utility functions |
| `keys.ts` | Observability env vars (`SENTRY_DSN`, `OTEL_*`) via t3-env |
| `index.ts` | Barrel export |

Config files at root:
- `src/sentry.server.config.ts` — Sentry server configuration (loaded by Next.js instrumentation hook)
- `src/sentry.edge.config.ts` — Sentry Edge configuration
- `src/instrumentation.ts` — Next.js instrumentation hook (loads Sentry configs by runtime)

## Usage Patterns

### Capture Errors

```typescript
import { captureError } from "@/shared/observability" // or server/client for init

try {
  await riskyOperation()
} catch (error) {
  captureError(error, { tags: { feature: "irc" } })
  throw error
}
```

### Custom Spans (OpenTelemetry)

```typescript
import { createMetricSpan } from "@/shared/observability/helpers"

const result = await createMetricSpan(
  "irc.createAccount",
  "irc.create",
  {},
  () => createIrcAccount(username)
)
```

### Logging

Use the observability helpers — **not raw `console.*`** in production code:

```typescript
import { log } from "@/shared/observability"

log.info({ userId, action: "create_irc_account" }, "IRC account created")
log.error({ error }, "Failed to create IRC account")
```

## Environment Variables

- `SENTRY_DSN` — Sentry project DSN (required for error tracking)
- `SENTRY_ORG`, `SENTRY_PROJECT` — for Sentry CLI (builds/sourcemaps)
- `NEXT_PUBLIC_SENTRY_DSN` — client-side DSN (public var)

## Critical Rules

- **Never use `console.error` / `console.log` in production code** — use the observability helpers.
- **`server.ts` is server-only** — it imports Node.js modules; never import in client components.
- **`client.ts` is client-safe** — safe to use in `"use client"` components.
- **Don't initialize Sentry manually** — the instrumentation hook and config files handle this. Don't call `Sentry.init()` anywhere else.
- Sentry source map uploads happen at build time via `next.config.ts` — no manual step needed.
