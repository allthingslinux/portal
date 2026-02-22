# Code Standards

This project uses **Ultracite** (Biome) for automated formatting and linting. Run `pnpm fix` to auto-fix most issues. These rules cover what Biome can't enforce automatically.

## Type Safety

- Prefer `unknown` over `any`
- Use const assertions (`as const`) for immutable values and literal types
- Leverage type narrowing instead of type assertions
- Extract magic numbers/strings into named constants (`src/shared/utils/constants.ts`)
- Import types from centralized `src/shared/types/` — don't duplicate type definitions

## Modern TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Use template literals over string concatenation
- Use destructuring for object and array assignments

## Async & Promises

- Always `await` promises — don't forget to use the return value
- Use `async/await` over promise chains
- Handle errors with try-catch blocks
- Don't use async functions as Promise executors

## React & JSX

- Function components only
- Hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays
- Use unique IDs for `key` props (not array indices)
- Don't define components inside other components
- Use `ref` as a prop (React 19+), not `React.forwardRef`
- **Server Components for async data fetching** — not async Client Components
- Mark client components with `"use client"` only when strictly necessary (interactivity, browser APIs, hooks)

## BetterAuth

- Always use `@/auth` module for server-side auth operations (never bypass with raw DB queries)
- Always use `authClient` from `@/auth` for client-side session access
- Use `auth.api.*` methods for server-side operations
- Session data lives in `SessionData` type from `@/types/auth` — don't roll your own
- Permission checks: use `usePermissions()` (client) or `checkPermission()` from `@/features/auth/lib/permissions` (server)

## Error Handling

- No `console.log`, `debugger`, or `alert` in production code
- Use the observability module for logging — not raw `console.*`
- Throw `Error` objects with descriptive messages, not plain strings
- Prefer early returns over nested conditionals
- **Next.js server actions**: Do not wrap `redirect()`, `notFound()`, `forbidden()`, or `unauthorized()` in try-catch; they throw internally. Use `unstable_rethrow(error)` if you must catch in the same block.

## Environment Variables

- Never access `process.env` directly — always use the module's `keys()` function
- Each module that needs env vars must have its own `keys.ts` using `@t3-oss/env-nextjs`
- Client-safe env vars must be declared in the `client:` section of `createEnv()`

## Security

- `rel="noopener"` on `target="_blank"` links
- No `dangerouslySetInnerHTML` unless absolutely necessary (and always sanitize)
- No `eval()` or direct `document.cookie` assignment
- Validate and sanitize all user inputs with Zod schemas
- Never expose secrets, API keys, or internal IDs in client-rendered code

## Performance

- No spread syntax in accumulators within loops
- Top-level regex literals, not created in loops
- Specific imports over namespace imports
- **No barrel files in app code** — prefer direct imports. `shared/*/index.ts` files are for package-level APIs only.
- Use `next/image`, never raw `<img>` tags
- Use `QUERY_CACHE` constants for TanStack Query stale/gc times — don't hardcode durations

## Accessibility

- Meaningful alt text for images
- Proper heading hierarchy
- Labels for all form inputs
- Keyboard event handlers alongside mouse events
- Semantic elements (`<button>`, `<nav>`, `<main>`) instead of divs with click handlers

## Testing

- Assertions inside `it()` or `test()` blocks only
- Use async/await, not done callbacks
- No `.only` or `.skip` in committed code
- Keep test suites flat — avoid excessive `describe` nesting

## What Biome Won't Catch

Focus manual review on: business logic correctness, meaningful naming, architecture decisions (especially client/server boundaries), edge cases in integration flows, and documentation for non-obvious logic.
