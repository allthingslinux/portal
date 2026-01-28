# TypeScript configuration (tsconfig.json)

This document describes the TypeScript configuration used by the Portal app and the rationale for each option. The project uses Next.js and Turbopack; TypeScript is used for type-checking only—emission is handled by the bundler.

Reference: [TypeScript TSConfig Reference](https://www.typescriptlang.org/tsconfig/).

---

## compilerOptions

### Project & module resolution

| Option   | Value   | Purpose |
|----------|---------|---------|
| `baseUrl` | `"."`   | Root for resolving non-relative module names. Required when using `paths`. |
| `paths`   | (see below) | Path aliases for imports (e.g. `@/auth`, `@/db`). Resolved relative to `baseUrl`. Path aliases are documented in [PATH_ALIASES.md](./PATH_ALIASES.md). **Note:** `paths` only affects type-checking; the bundler (Next.js) must resolve the same mappings at build time (Next.js reads from tsconfig). |

### Language & environment

| Option | Value   | Purpose |
|--------|---------|---------|
| `target` | `"ESNext"` | Emit target is irrelevant when `noEmit: true`; this affects which built-in libs are assumed and how types are inferred. ESNext matches the runtime/bundler output. |
| `lib`    | `["dom", "dom.iterable", "esnext"]` | Explicit APIs for the environment: DOM, DOM iterables, and latest JS. Keeps typings aligned with actual usage. |
| `jsx`    | `"react-jsx"` | Use the React 17+ automatic JSX runtime. No need to import React in every file for JSX. |

### Module system (bundler)

| Option               | Value      | Purpose |
|----------------------|------------|---------|
| `module`             | `"esnext"` | Preserves modern ESM in type-checking; Next.js/Turbopack handle emit. |
| `moduleResolution`   | `"bundler"` | Resolution tailored for bundlers: supports `package.json` `exports`/`imports`, no file-extension requirement on relative imports. |
| `resolveJsonModule`  | `true`    | Allow `import ... from "./file.json"` and type inference from JSON. Used for locale files etc. |
| `isolatedModules`    | `true`    | **Required** for Next.js/SWC: each file must transpile in isolation (no cross-file type-only emit). |
| `allowJs`            | `true`    | Allow importing `.js`/`.jsx` so TS and JS can coexist during migration or for config/legacy files. |

### Emit

| Option   | Value  | Purpose |
|----------|--------|---------|
| `noEmit` | `true` | TypeScript does not emit JS; Next.js/Turbopack do. Use `pnpm type-check` (`tsc --noEmit`) for type-checking. |

### Type checking

| Option                           | Value  | Purpose |
|----------------------------------|--------|---------|
| `strict`                         | `true` | Enables the full strict family: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, etc. Recommended. |
| `forceConsistentCasingInFileNames` | `true` | Errors if import path casing differs from the path on disk. Avoids bugs on case-sensitive file systems. Default, made explicit. |
| `noFallthroughCasesInSwitch`    | `true` | Errors on switch fallthrough unless `break`/`return`/`throw`. Prevents accidental fallthrough bugs. |

### Build performance & tooling

| Option                 | Value  | Purpose |
|------------------------|--------|---------|
| `skipLibCheck`         | `true` | Skip type-checking of `.d.ts` files. Speeds up compilation; recommended when dependencies have valid declaration files. |
| `incremental`          | `true` | Persist build info (e.g. `.tsbuildinfo`) for faster subsequent type-checks. |
| `esModuleInterop`      | `true` | Improves interop with CommonJS default exports and namespace imports. Common for Node/Next.js. |

### Next.js

| Option    | Value | Purpose |
|-----------|------|---------|
| `plugins` | `[{ "name": "next" }]` | Next.js TypeScript plugin for App Router, `next/types`, and other Next-specific typings. |

---

## include

- `next-env.d.ts` — Next.js type references and generated route types.
- `**/*.ts`, `**/*.tsx`, `**/*.mts` — All TypeScript sources.
- `.next/types/**/*.ts`, `.next/dev/types/**/*.ts` — Next.js generated types (e.g. `typedRoutes`, route types). Populated by `next typegen` / `next build`.

---

## exclude

- `node_modules/**` — Default; avoids pulling in dependency sources.
- `references/**` — Project-specific; exclude if that directory holds non-app code or legacy refs.

(Shadcn UI under `src/components/ui/` is included and type-checked; no separate exclude in the current tsconfig.)

---

## Validation and scripts

- **Type-check only:** `pnpm type-check` runs `tsc --noEmit`.
- **Build:** `next build` runs `next typegen` then the build; Next uses this tsconfig and fails the build on TypeScript errors (`typescript.ignoreBuildErrors: false` in `next.config.ts`).

---

## Practices applied

1. **Strict mode** — `strict: true` for maximum type safety.
2. **Bundler-oriented** — `moduleResolution: "bundler"` and `module: "esnext"` match Next.js/Turbopack.
3. **No emit from tsc** — `noEmit: true` keeps TypeScript as type-checker; Next.js owns emit.
4. **Explicit path aliases** — All `@/` aliases are defined in tsconfig and documented in [PATH_ALIASES.md](./PATH_ALIASES.md).
5. **Incremental type-check** — `incremental: true` speeds up repeated `tsc --noEmit` and IDE usage.
6. **Consistent casing** — `forceConsistentCasingInFileNames` avoids cross-OS import bugs.
7. **Safe switch usage** — `noFallthroughCasesInSwitch` reduces logic errors in `switch` statements.

Optional future options (only if you decide to adopt them):

- `verbatimModuleSyntax` — Requires explicit `type` on type-only imports/exports; improves consistency and tooling (TS 5.0+).
- `noUncheckedIndexedAccess` — Index access types include `undefined`; stricter but noisier.
- `exactOptionalPropertyTypes` — Distinguishes “missing” from “present and undefined”; stricter optional props.
