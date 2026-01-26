# Logging Best Practices

Portal implements **wide events** (canonical log lines) for powerful debugging and analytics. This pattern emits one context-rich event per request per service, enabling queryable logs with high cardinality and dimensionality.

## Core Principles

### 1. Wide Events (CRITICAL)

Emit **one context-rich event per request per service**. Instead of scattering log lines throughout your handler, consolidate everything into a single structured event emitted at request completion.

### 2. High Cardinality & Dimensionality (CRITICAL)

Include fields with high cardinality (user IDs, request IDs - millions of unique values) and high dimensionality (many fields per event). This enables querying by specific users and answering questions you haven't anticipated yet.

### 3. Business Context (CRITICAL)

Always include business context: user subscription tier, cart value, feature flags, account age. The goal is to know "a premium customer couldn't complete a $2,499 purchase" not just "checkout failed."

### 4. Environment Characteristics (CRITICAL)

Environment context (commit hash, version, service name, region) is automatically included in all logs via the logger. No manual addition needed.

## Implementation

### For API Route Handlers

Use the `withWideEvent` wrapper to automatically handle wide event creation, timing, and emission:

```typescript
import { withWideEvent, enrichWideEventWithUser, type WideEvent } from "@/shared/observability";
import { requireAuth } from "@/shared/api/utils";

export const GET = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    const { userId, session } = await requireAuth(request);

    // Enrich event with user context (high cardinality)
    enrichWideEventWithUser(event, {
      id: userId,
      email: session.user.email,
      role: session.user.role,
    });

    // Add business context as you process the request
    const data = await getData(userId);
    event.data_count = data.length;
    event.has_premium = session.user.role === "premium";

    return Response.json({ data });
  }
);
```

### Manual Wide Event Pattern

If you need more control, you can manually create and emit wide events:

```typescript
import {
  createWideEvent,
  emitWideEvent,
  enrichWideEventWithError,
  enrichWideEventWithUser,
} from "@/shared/observability";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const event = createWideEvent(request);

  try {
    const { userId } = await requireAuth(request);
    enrichWideEventWithUser(event, { id: userId });

    // Add business context
    const cart = await getCart(userId);
    event.cart = {
      total_cents: cart.total,
      item_count: cart.items.length,
    };

    const order = await createOrder(cart);
    event.order_id = order.id;
    event.status_code = 201;
    event.outcome = "success";

    return Response.json({ order }, { status: 201 });
  } catch (error) {
    enrichWideEventWithError(event, error);
    event.status_code = 500;
    event.outcome = "error";
    throw error;
  } finally {
    event.duration_ms = Date.now() - startTime;
    emitWideEvent(event);
  }
}
```

## What Gets Logged Automatically

The logger automatically includes environment context in every log entry:

- `commit_hash`: Git commit SHA
- `version`: Service version (from SENTRY_RELEASE or package.json)
- `service`: Service name (defaults to "portal")
- `environment`: NODE_ENV
- `node_version`: Node.js version
- `region`, `instance_id`, etc.: Infrastructure details (if available)

## Wide Event Structure

```typescript
interface WideEvent {
  // Request identification (high cardinality)
  request_id: string;
  timestamp: string;

  // HTTP request context
  method: string;
  path: string;
  pathname?: string;
  user_agent?: string;
  ip?: string;

  // Response context
  status_code?: number;
  outcome?: "success" | "error";
  duration_ms?: number;

  // Error context (if applicable)
  error?: {
    type: string;
    message: string;
    stack?: string;
  };

  // Business context (enriched by handlers)
  user?: {
    id: string;
    email?: string;
    role?: string;
  };

  // Additional context (enriched by handlers)
  [key: string]: unknown;
}
```

## Best Practices

### ✅ DO

- Use `withWideEvent` wrapper for API route handlers
- Include high cardinality fields (user_id, request_id)
- Include business context (subscription tier, cart value, feature flags)
- Add context as you process the request
- Let the wrapper handle timing and emission

### ❌ DON'T

- Scatter multiple `log.info()` calls throughout a handler
- Log unstructured strings: `log.info("something happened")`
- Manually add environment context (it's automatic)
- Skip business context - technical logs alone aren't enough

## Examples

### Example 1: User Profile Update

```typescript
export const PATCH = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    const { userId, session } = await requireAuth(request);
    enrichWideEventWithUser(event, {
      id: userId,
      email: session.user.email,
      role: session.user.role,
    });

    const body = await request.json();
    event.update_fields = Object.keys(body);

    const updated = await updateUser(userId, body);
    event.update_successful = true;
    event.name_updated = body.name !== undefined;

    return Response.json({ user: updated });
  }
);
```

### Example 2: Admin User Management

```typescript
export const GET = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Add query context
    event.filter_role = role || null;
    event.filter_search = search || null;

    const users = await getUsers({ role, search });
    event.users_count = users.length;
    event.has_results = users.length > 0;

    return Response.json({ users });
  }
);
```

## Request ID Propagation

Request IDs are automatically generated and can be propagated to downstream services:

```typescript
// In your route handler
const event = createWideEvent(request);
const requestId = event.request_id;

// When calling downstream services
await fetch("https://api.example.com/data", {
  headers: {
    "x-request-id": requestId, // Propagate the ID
  },
});
```

## References

- [Stripe - Canonical Log Lines](https://stripe.com/blog/canonical-log-lines)
- [Logging Sucks](https://loggingsucks.com)
- [Observability Wide Events 101](https://boristane.com/blog/observability-wide-events-101/)
