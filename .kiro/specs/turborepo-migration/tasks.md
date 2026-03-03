# Implementation Plan: Turborepo Migration

## Overview

Migrate the Portal project from a single Next.js 16 app into a Turborepo monorepo. The migration follows a strict incremental approach: scaffold the monorepo root, move the app into `apps/portal/`, extract internal packages leaf-first from `src/shared/` and `src/components/`, update imports, then update CI/CD and Docker. The app must remain functional at every step.

## Tasks

- [x] 1. Scaffold monorepo root configuration
  - [x] 1.1 Create `packages/typescript-config/` with `package.json`, `base.json`, `nextjs.json`, and `library.json` presets
    - Define strict base config (`ESNext`, `bundler` module resolution, `strict: true`)
    - `nextjs.json` extends base with JSX, DOM libs, `noEmit`, incremental, Next.js plugin
    - `library.json` extends base with JSX, DOM libs, `noEmit: true`
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 1.2 Create `packages/biome-config/` with `package.json` and `biome.jsonc`
    - Extend Ultracite presets (`ultracite/biome/core`, `ultracite/biome/react`, `ultracite/biome/next`)
    - Preserve `noBarrelFile: "error"` and `noNamespaceImport: "error"` with existing overrides
    - Preserve existing import ordering configuration
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 1.3 Create root `turbo.json` with the full task pipeline
    - Define `build`, `check`, `fix`, `type-check`, `test`, `dev`, `typegen`, `transit`, `db:generate`, `db:migrate`, `db:push` tasks
    - Configure cache inputs/outputs, env var passthrough, `globalDependencies`, `globalEnv`
    - Mark `fix`, `db:*` tasks as non-cacheable; `dev` as persistent
    - Use `transit` task for `check`/`type-check` cache invalidation propagation
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 2.7_

  - [x] 1.4 Update `pnpm-workspace.yaml` to include `apps/*` and `packages/*` globs
    - Preserve existing `onlyBuiltDependencies` entries
    - _Requirements: 1.2, 1.6_

  - [x] 1.5 Create new root `package.json` for the monorepo
    - Add scripts delegating to `turbo run` for build, check, fix, type-check, test
    - Add scoped scripts for db, auth, release, compose commands
    - Add `preinstall` script enforcing pnpm via `only-allow`
    - Add `turbo` as root devDependency
    - Keep `ultracite`, `@biomejs/biome`, `husky`, `lint-staged`, `@commitlint/*` as root devDependencies
    - Set `packageManager` and `engines` fields
    - _Requirements: 1.3, 1.4, 1.5, 11.1_

- [x] 2. Checkpoint — Verify monorepo scaffolding
  - Ensure `pnpm install` succeeds at the monorepo root with the new workspace config
  - Ensure all config packages are linked correctly
  - Ask the user if questions arise.

- [x] 3. Move the Next.js app into `apps/portal/`
  - [x] 3.1 Create `apps/portal/` directory and move app files
    - Move `src/`, `public/`, `locale/`, `tests/`, `scripts/`, `drizzle/`, `references/`, `examples/` into `apps/portal/`
    - Move app config files: `next.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `vitest.server-only-mock.ts`, `postcss.config.mjs`, `components.json`, `next-env.d.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`
    - Move `.env` into `apps/portal/`
    - Move Sentry config files (`instrumentation.ts`, `sentry.*.config.ts`) if they exist at root
    - _Requirements: 7.1, 7.2, 12.1_

  - [x] 3.2 Create `apps/portal/package.json` with all app dependencies
    - Move runtime and dev dependencies from the old root `package.json` to `apps/portal/package.json`
    - Add `@portal/*` workspace dependencies (`workspace:*` protocol)
    - Keep `tsx`, `vitest`, `drizzle-kit`, `semantic-release` and plugins as app devDependencies
    - Define app scripts: `dev`, `build`, `start`, `check`, `fix`, `type-check`, `test`, `typegen`, `db:*`, `auth:*`, `create-admin`, etc.
    - _Requirements: 7.1, 11.5, 11.6_

  - [x] 3.3 Update `apps/portal/tsconfig.json` to extend `@portal/typescript-config/nextjs.json`
    - Preserve `@/` path alias pointing to `./src/`
    - Remove dedicated `@/db`, `@/ui` aliases (will be replaced by package imports later)
    - _Requirements: 3.5, 7.4_

  - [x] 3.4 Update root `biome.jsonc` to extend `@portal/biome-config`
    - Add app-specific overrides as needed
    - _Requirements: 4.5_

  - [x] 3.5 Create `apps/portal/turbo.json` with package-level overrides
    - Override `type-check` to depend on `transit` and `typegen`
    - Override `build` to depend on `^build` and `typegen`
    - _Requirements: 2.6, 7.5_

- [x] 4. Checkpoint — Verify app move
  - Ensure `pnpm install` succeeds from the monorepo root
  - Ensure `pnpm build` succeeds (single app, no extracted packages yet)
  - Ensure `pnpm type-check` passes
  - Ask the user to verify `pnpm dev` works manually.

- [x] 5. Extract `@portal/types` package
  - [x] 5.1 Create `packages/types/` with `package.json`, `tsconfig.json`
    - JIT package pattern: `exports` with `"./*"` pointing to `.ts` source
    - `private: true`, `type: "module"`, `check`/`fix`/`type-check` scripts
    - Extend `@portal/typescript-config/library.json`
    - Zero internal dependencies (leaf package)
    - _Requirements: 5.1, 5.2, 5.4, 5.6, 13.1_

  - [x] 5.2 Move type files from `src/shared/types/` to `packages/types/src/`
    - Move `api.ts`, `auth.ts`, `common.ts`, `email.ts`, `routes.ts`
    - Ensure no barrel `index.ts` file exists
    - _Requirements: 5.7_

  - [x] 5.3 Update all imports from `@/shared/types/*` and `@/types/*` to `@portal/types/*`
    - Rewrite across `apps/portal/src/` and any other packages that depend on types
    - Use direct subpath imports (e.g., `@portal/types/auth`)
    - _Requirements: 6.1, 6.2_

  - [x] 5.4 Write property tests for `@portal/types` package structure
    - **Property 4: JIT package exports point to TypeScript source**
    - **Property 5: Package structure conformance (`private: true`, scripts)**
    - **Property 6: TypeScript config inheritance (extends `library.json`)**
    - **Property 7: No barrel files in wildcard-export packages**
    - **Validates: Requirements 5.2, 5.6, 5.7, 13.1, 3.4**

- [x] 6. Extract `@portal/utils` package
  - [x] 6.1 Create `packages/utils/` with `package.json`, `tsconfig.json`
    - JIT package pattern with wildcard exports
    - Dependencies: `clsx`, `tailwind-merge`, `date-fns`
    - Zero internal package dependencies (leaf package)
    - _Requirements: 5.1, 5.2, 5.4, 5.6_

  - [x] 6.2 Move utility files from `src/shared/utils/` to `packages/utils/src/`
    - Move `constants.ts`, `date.ts`, `email.ts`, `error.ts`, `format.ts`, `string.ts`, `utils.ts`
    - _Requirements: 5.7_

  - [x] 6.3 Update all imports from `@/shared/utils/*` to `@portal/utils/*`
    - Rewrite across the entire codebase
    - Use direct subpath imports (e.g., `@portal/utils/constants`, `@portal/utils/utils`)
    - _Requirements: 6.1, 6.2_

- [x] 7. Extract `@portal/schemas` package
  - [x] 7.1 Create `packages/schemas/` with `package.json`, `tsconfig.json`
    - Dependencies: `@portal/types` (`workspace:*`), `zod`, `zod-validation-error`
    - _Requirements: 5.1, 5.2, 5.4, 5.6_

  - [x] 7.2 Move schema files from `src/shared/schemas/` to `packages/schemas/src/`
    - Move `user.ts`, `utils.ts`, `integrations/` subdirectory
    - Update internal imports within schema files to use `@portal/types/*`
    - _Requirements: 5.3, 5.7_

  - [x] 7.3 Update all imports from `@/shared/schemas/*` to `@portal/schemas/*`
    - Use direct subpath imports (e.g., `@portal/schemas/user`)
    - _Requirements: 6.1, 6.2_

- [x] 8. Extract `@portal/db` package
  - [x] 8.1 Create `packages/db/` with `package.json`, `tsconfig.json`
    - Dependencies: `@portal/types` (`workspace:*`), `drizzle-orm`, `pg`, `@t3-oss/env-nextjs`, `zod`, `server-only`
    - DevDependencies: `drizzle-kit`
    - _Requirements: 5.1, 5.2, 5.4, 5.6_

  - [x] 8.2 Move db files from `src/shared/db/` to `packages/db/src/`
    - Move `client.ts`, `config.ts`, `keys.ts`, `relations.ts`, `schema/` subdirectory
    - Move `drizzle/` migrations to `packages/db/drizzle/`
    - Update drizzle-kit config path references
    - Update internal imports to use `@portal/types/*`
    - _Requirements: 5.3_

  - [x] 8.3 Update all imports from `@/db/*` and `@/shared/db/*` to `@portal/db/*`
    - Rewrite `@/db` → `@portal/db/client`, `@/db/schema` → `@portal/db/schema`, etc.
    - _Requirements: 6.1, 6.4_

- [x] 9. Checkpoint — Verify core package extractions
  - Ensure `pnpm install` succeeds
  - Ensure `pnpm type-check` passes with types, utils, schemas, and db extracted
  - Ask the user if questions arise.

- [x] 10. Extract `@portal/email` package
  - [x] 10.1 Create `packages/email/` with `package.json`, `tsconfig.json`
    - Single-file module: use `"."` export entry pointing to `./src/index.ts`
    - Dependencies: `@portal/types` (`workspace:*`)
    - _Requirements: 5.1, 5.2, 5.8_

  - [x] 10.2 Move email files from `src/shared/email/` to `packages/email/src/`
    - Update internal imports to use `@portal/types/*`
    - _Requirements: 5.3_

  - [x] 10.3 Update all imports from `@/shared/email` to `@portal/email`
    - _Requirements: 6.1_

- [x] 11. Extract `@portal/observability` package
  - [x] 11.1 Create `packages/observability/` with `package.json`, `tsconfig.json`
    - Dependencies: `@sentry/nextjs`, `@t3-oss/env-nextjs`, `zod`
    - _Requirements: 5.1, 5.2, 5.4, 5.6_

  - [x] 11.2 Move observability files from `src/shared/observability/` to `packages/observability/src/`
    - Move `client.ts`, `edge.ts`, `server.ts`, `helpers.ts`, `keys.ts`, `utils.ts`, `wide-events.ts`
    - _Requirements: 5.3_

  - [x] 11.3 Update all imports from `@/shared/observability/*` to `@portal/observability/*`
    - _Requirements: 6.1_

- [x] 12. Extract `@portal/seo` package
  - [x] 12.1 Create `packages/seo/` with `package.json`, `tsconfig.json`
    - Dependencies: `next`, `schema-dts`
    - _Requirements: 5.1, 5.2, 5.4, 5.6_

  - [x] 12.2 Move seo files from `src/shared/seo/` to `packages/seo/src/`
    - Move `json-ld.tsx`, `metadata.ts`, `robots.ts`, `sitemap.ts`
    - _Requirements: 5.3_

  - [x] 12.3 Update all imports from `@/shared/seo/*` to `@portal/seo/*`
    - _Requirements: 6.1_

- [x] 13. Extract `@portal/api` package
  - [x] 13.1 Create `packages/api/` with `package.json`, `tsconfig.json`
    - Dependencies: `@portal/types` (`workspace:*`), `@tanstack/react-query`
    - _Requirements: 5.1, 5.2, 5.4, 5.6_

  - [x] 13.2 Move api infra files from `src/shared/api/` to `packages/api/src/`
    - Move `hydration.ts`, `query-client.ts`, `query-keys.ts`, `server-queries.ts`, `types.ts`, `utils.ts`
    - Update internal imports to use `@portal/types/*`
    - _Requirements: 5.3_

  - [x] 13.3 Update all imports from `@/shared/api/*` to `@portal/api/*`
    - Use direct subpath imports (e.g., `@portal/api/query-keys`, `@portal/api/query-client`)
    - _Requirements: 6.1, 6.2_

- [x] 14. Extract `@portal/ui` package
  - [x] 14.1 Create `packages/ui/` with `package.json`, `tsconfig.json`
    - Dependencies: `@portal/utils` (`workspace:*`), all Radix UI packages, `lucide-react`, `class-variance-authority`, `tailwind-merge`, `clsx`, `cmdk`, `sonner`, `vaul`, `react-resizable-panels`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `recharts`
    - _Requirements: 5.1, 5.2, 5.4, 5.6_

  - [x] 14.2 Move component files from `src/components/` to `packages/ui/src/`
    - Move `ui/` (shadcn primitives), `icons/`, `layout/`, `command-menu.tsx`, `dev-tools.tsx`
    - Update internal imports within UI components to use `@portal/utils/utils` for `cn()`
    - _Requirements: 5.3_

  - [x] 14.3 Update all imports from `@/components/*` and `@/ui/*` to `@portal/ui/*`
    - Rewrite `@/components/ui/button` → `@portal/ui/ui/button`
    - Rewrite `@/components/layout` → `@portal/ui/layout`
    - Rewrite `@/ui/*` → `@portal/ui/ui/*`
    - _Requirements: 6.1, 6.5_

  - [x] 14.4 Update `components.json` in `apps/portal/` for shadcn CLI
    - Update aliases and output paths to point to `@portal/ui` package
    - _Requirements: 11.3_

- [x] 15. Checkpoint — Verify all package extractions
  - Ensure `pnpm install` succeeds
  - Ensure `pnpm type-check` passes with all packages extracted
  - Ensure no stale `@/shared/*`, `@/components/*`, `@/db`, or `@/ui/*` imports remain
  - Ask the user if questions arise.

- [x] 16. Write property tests for monorepo structural correctness
  - [x] 16.1 Write property test: Dependency acyclicity
    - **Property 1: Dependency acyclicity**
    - Verify the package dependency graph is a DAG with no cycles
    - **Validates: Requirements 5.5, 14.1**

  - [x] 16.2 Write property test: No stale imports remain
    - **Property 2: No stale imports remain**
    - Grep all source files for old `@/shared/*`, `@/components/*`, `@/db`, `@/ui/*` import patterns
    - **Validates: Requirements 6.1, 6.4, 6.5**

  - [x] 16.3 Write property test: Package boundary enforcement
    - **Property 3: Package boundary enforcement**
    - Verify no file in `packages/*/src/` uses `@/` alias or relative cross-package paths
    - **Validates: Requirements 13.2, 13.3**

  - [x] 16.4 Write property test: Environment variable completeness
    - **Property 8: Environment variable completeness**
    - Verify all env vars in `keys.ts` files appear in `turbo.json` env arrays
    - **Validates: Requirements 2.4, 12.2, 13.4**

  - [x] 16.5 Write property test: No direct process.env access in packages
    - **Property 9: No direct process.env access in packages**
    - Verify no file other than `keys.ts` in packages contains `process.env`
    - **Validates: Requirement 12.5**

  - [x] 16.6 Write property test: Import path correctness
    - **Property 10: Import path correctness**
    - Verify all `@portal/*` imports use direct subpaths (except `@portal/email`)
    - **Validates: Requirement 6.2**

  - [x] 16.7 Write property test: App-internal alias preservation
    - **Property 11: App-internal alias preservation**
    - Verify `@/auth`, `@/features/*`, `@/hooks/*`, `@/config`, `@/env` imports are preserved
    - **Validates: Requirement 6.3**

  - [x] 16.8 Write property test: Package dependency completeness
    - **Property 14: Package dependency completeness**
    - Verify every runtime import in each package resolves to a declared dependency
    - **Validates: Requirement 5.4**

- [x] 17. Update CI/CD pipeline for monorepo
  - [x] 17.1 Update `.github/workflows/ci.yml` change detection patterns
    - Add `packages/*/src/**/*.{ts,tsx}` to file change detection
    - Update TypeScript, config, and test file patterns to include both `apps/portal/` and `packages/`
    - _Requirements: 9.1_

  - [x] 17.2 Update CI jobs to use `turbo run` commands
    - Replace direct lint/type-check/build/test commands with `pnpm check`, `pnpm type-check`, `pnpm build`, `pnpm test`
    - Add `pnpm typegen` before `pnpm type-check`
    - _Requirements: 9.2, 9.5_

  - [x] 17.3 Update CI cache and artifact paths
    - Update Next.js build cache path to `apps/portal/.next/cache`
    - Update coverage upload path to `apps/portal/coverage/lcov.info`
    - _Requirements: 9.3, 9.4_

- [x] 18. Update Containerfile for monorepo Docker builds
  - [x] 18.1 Rewrite `Containerfile` with multi-stage turbo prune build
    - Stage 1 (pruner): Install turbo, run `turbo prune @portal/portal --docker`
    - Stage 2 (deps): Copy pruned `package.json` files, run `pnpm install --frozen-lockfile`
    - Stage 3 (builder): Copy full source, run `pnpm turbo run build --filter=@portal/portal`
    - Stage 4 (runner): Copy standalone output, static assets, public files only
    - Include health check for `/api/health`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 18.2 Update `.dockerignore` for monorepo structure
    - Ensure `node_modules`, `.next`, `.turbo`, `coverage` are ignored across all packages
    - _Requirements: 8.4_

- [x] 19. Update tooling configuration
  - [x] 19.1 Update `apps/portal/env.ts` to aggregate package `keys()` functions
    - Update imports from `@/shared/*/keys` to `@portal/*/keys` where applicable
    - _Requirements: 12.2, 12.5_

  - [x] 19.2 Verify and update lint-staged, commitlint, and husky configs at root
    - Ensure `.lintstagedrc.json` paths work with the monorepo structure
    - Ensure `.husky/` hooks run correctly from the git root
    - _Requirements: 11.1, 11.2_

  - [x] 19.3 Update semantic-release configuration
    - Ensure `.releaserc.json` references correct paths for `CHANGELOG.md` and `package.json`
    - _Requirements: 11.4_

  - [x] 19.4 Verify Vitest configuration resolves `@portal/*` imports
    - Update `vitest.config.ts` resolve aliases if pnpm workspace linking doesn't handle resolution automatically
    - _Requirements: 10.2, 10.4_

- [x] 20. Final checkpoint — Full verification
  - Ensure `pnpm install` succeeds from the monorepo root
  - Ensure `pnpm type-check` passes across all packages and the app
  - Ensure `pnpm build` succeeds from the monorepo root
  - Ensure `pnpm test` passes (excluding the 2 known pre-existing `vi.mock` hoisting failures)
  - Ensure `pnpm check` (Biome lint) passes across all packages
  - Ask the user to verify `pnpm dev` works manually
  - Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation — the app must work at every step
- Package extraction follows leaf-first dependency order to avoid cycles
- Property tests validate structural correctness of the monorepo (no stale imports, no cycles, proper boundaries)
- The `@/` alias inside `apps/portal/` continues to resolve to `apps/portal/src/` for app-internal imports
- `ultracite` and `@biomejs/biome` remain as root devDependencies, not per-package
