# Requirements Document

## Introduction

This document defines the requirements for migrating the Portal project from a single Next.js 16 application into a Turborepo monorepo. The migration extracts shared infrastructure from `src/shared/` and UI components from `src/components/` into internal packages under `packages/`, while keeping the Next.js application as the sole deployable app under `apps/portal/`. The migration is incremental — the application continues to function at every step — and leverages Turborepo's task graph, caching, and environment variable handling to improve CI and local development performance.

## Glossary

- **Monorepo_Root**: The top-level directory containing `turbo.json`, `pnpm-workspace.yaml`, and the `apps/` and `packages/` directories.
- **Turborepo**: The build system tool that orchestrates task execution, caching, and dependency ordering across workspace packages.
- **Internal_Package**: A private npm package under `packages/` that is consumed by the app via `workspace:*` protocol (e.g., `@portal/utils`, `@portal/ui`).
- **JIT_Package**: A "Just-in-Time" internal package whose `exports` field points directly to TypeScript source files, requiring no build step — the consuming bundler transpiles the source.
- **Portal_App**: The Next.js 16 application located at `apps/portal/`, the sole deployable artifact.
- **Task_Pipeline**: The Turborepo task graph defined in `turbo.json` that specifies task dependencies, cache inputs/outputs, and environment variable passthrough.
- **Workspace**: The pnpm workspace defined by `pnpm-workspace.yaml` that links `apps/*` and `packages/*` directories.
- **Transit_Task**: A virtual Turborepo task with no script that propagates cache invalidation through the dependency graph without requiring builds.
- **Turbo_Prune**: The `turbo prune` command that generates a minimal workspace subset for Docker builds, containing only the packages a specific app depends on.
- **Import_Alias**: A TypeScript path alias (e.g., `@/`, `@portal/`) that maps to a directory or package for module resolution.

## Requirements

### Requirement 1: Monorepo Root Scaffolding

**User Story:** As a developer, I want the project structured as a Turborepo monorepo with pnpm workspaces, so that I can manage multiple packages with shared tooling and parallel task execution.

#### Acceptance Criteria

1. THE Monorepo_Root SHALL contain a `turbo.json` file that defines the task pipeline for `build`, `check`, `fix`, `type-check`, `test`, `dev`, `typegen`, `db:generate`, `db:migrate`, and `db:push` tasks.
2. THE Monorepo_Root SHALL contain a `pnpm-workspace.yaml` file that declares `apps/*` and `packages/*` as workspace globs.
3. THE Monorepo_Root SHALL contain a root `package.json` with scripts that delegate to `turbo run` for build, check, fix, type-check, and test commands.
4. THE Monorepo_Root SHALL enforce pnpm as the sole package manager via a `preinstall` script that rejects npm and yarn.
5. THE Monorepo_Root SHALL declare `turbo` as a root devDependency.
6. WHEN `pnpm install` is run at the Monorepo_Root, THE Workspace SHALL link all internal packages via the `workspace:*` protocol.

### Requirement 2: Task Pipeline Configuration

**User Story:** As a developer, I want Turborepo to orchestrate builds with correct dependency ordering and caching, so that only changed packages are rebuilt and CI runs faster.

#### Acceptance Criteria

1. WHEN the `build` task is executed, THE Task_Pipeline SHALL build all upstream dependencies before building downstream consumers via the `^build` dependency pattern.
2. WHEN source files, config files, or environment variables change, THE Task_Pipeline SHALL invalidate the cache for affected tasks.
3. WHILE the `dev` task is running, THE Task_Pipeline SHALL treat the task as persistent and never cache its output.
4. THE Task_Pipeline SHALL declare all build-time environment variables (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NODE_ENV`, `NEXT_PUBLIC_*`, `SENTRY_*`, `GIT_COMMIT_SHA`) in the `build` task's `env` array.
5. THE Task_Pipeline SHALL use a Transit_Task to propagate cache invalidation for `check` and `type-check` tasks without requiring upstream builds.
6. WHEN the `type-check` task runs for Portal_App, THE Task_Pipeline SHALL depend on the `typegen` task to ensure Next.js RouteContext types are generated first.
7. THE Task_Pipeline SHALL mark database tasks (`db:generate`, `db:migrate`, `db:push`) and the `fix` task as non-cacheable.

### Requirement 3: Shared TypeScript Configuration

**User Story:** As a developer, I want a single source of truth for TypeScript compiler options, so that all packages and the app use consistent settings.

#### Acceptance Criteria

1. THE `@portal/typescript-config` package SHALL provide a `base.json` preset with strict TypeScript settings (`strict: true`, `ESNext` target, `bundler` module resolution).
2. THE `@portal/typescript-config` package SHALL provide a `nextjs.json` preset that extends `base.json` and adds JSX, DOM libs, `noEmit`, incremental builds, and the Next.js plugin.
3. THE `@portal/typescript-config` package SHALL provide a `library.json` preset that extends `base.json` and adds JSX and DOM libs with `noEmit: true`.
4. WHEN a new Internal_Package is created, THE Internal_Package SHALL extend `@portal/typescript-config/library.json` in its `tsconfig.json`.
5. THE Portal_App SHALL extend `@portal/typescript-config/nextjs.json` in its `tsconfig.json`.

### Requirement 4: Shared Biome Configuration

**User Story:** As a developer, I want centralized linting and formatting rules, so that code style is consistent across all packages and the app.

#### Acceptance Criteria

1. THE `@portal/biome-config` package SHALL extend the Ultracite presets (`ultracite/biome/core`, `ultracite/biome/react`, `ultracite/biome/next`).
2. THE `@portal/biome-config` package SHALL enforce `noBarrelFile: "error"` and `noNamespaceImport: "error"` rules with the existing override patterns.
3. THE `@portal/biome-config` package SHALL preserve the existing import ordering configuration for React, UI libs, Next.js, form/validation, packages, internal aliases, and relative imports.
4. WHEN `turbo run check` is executed, THE Task_Pipeline SHALL run Biome checks across all packages in parallel.
5. THE Monorepo_Root `biome.jsonc` SHALL extend `@portal/biome-config` and add app-specific overrides.

### Requirement 5: Internal Package Extraction

**User Story:** As a developer, I want shared infrastructure and UI components extracted into internal packages with clear boundaries, so that modules are reusable and independently type-checkable.

#### Acceptance Criteria

1. THE migration SHALL extract the following Internal_Packages from the existing codebase: `@portal/types`, `@portal/utils`, `@portal/schemas`, `@portal/db`, `@portal/ui`, `@portal/api`, `@portal/email`, `@portal/observability`, `@portal/seo`.
2. WHEN an Internal_Package is extracted, THE Internal_Package SHALL use the JIT_Package pattern with `exports` pointing directly to TypeScript source files.
3. THE Internal_Package extraction order SHALL follow a leaf-first dependency order: `@portal/types` and `@portal/utils` first (zero internal dependencies), then packages that depend on them.
4. WHEN an Internal_Package is extracted, THE Internal_Package SHALL declare only its own runtime dependencies in its `package.json`.
5. THE Internal_Package dependency graph SHALL contain no cycles.
6. WHEN an Internal_Package is extracted, THE Internal_Package SHALL declare `check`, `fix`, and `type-check` scripts in its `package.json` for Turborepo parallel execution.
7. WHEN an Internal_Package uses the wildcard export pattern (`"./*"`), THE Internal_Package SHALL NOT contain barrel `index.ts` files, consistent with the `noBarrelFile: "error"` Biome rule.
8. THE `@portal/email` package SHALL use a `"."` export entry pointing to its single source file, as it is a single-file module.

### Requirement 6: Import Path Migration

**User Story:** As a developer, I want import paths updated from `@/` path aliases to `@portal/*` package imports for extracted modules, so that imports reflect the new package boundaries.

#### Acceptance Criteria

1. WHEN a module is extracted into an Internal_Package, THE migration SHALL rewrite all `@/shared/*` and `@/components/*` imports in the codebase to use the corresponding `@portal/*` package import.
2. WHEN imports are rewritten, THE migration SHALL use direct subpath imports (e.g., `@portal/utils/constants`) instead of barrel re-exports.
3. THE migration SHALL preserve `@/` path aliases for app-internal modules that remain in Portal_App (`@/auth`, `@/features/*`, `@/hooks/*`, `@/config`, `@/env`).
4. WHEN the `@/db` alias is migrated, THE migration SHALL rewrite it to `@portal/db/client` or the appropriate `@portal/db/*` subpath.
5. WHEN the `@/ui/*` alias is migrated, THE migration SHALL rewrite it to `@portal/ui/ui/*`.
6. WHEN all imports are rewritten, THE Portal_App SHALL pass `pnpm type-check` without errors.

### Requirement 7: Portal App Restructuring

**User Story:** As a developer, I want the Next.js application moved into `apps/portal/` with all app-specific files, so that the monorepo structure cleanly separates the app from shared packages.

#### Acceptance Criteria

1. THE Portal_App SHALL reside at `apps/portal/` and contain `src/`, `public/`, `locale/`, `tests/`, `scripts/`, and all app configuration files.
2. THE Portal_App SHALL retain `src/features/`, `src/hooks/`, `src/i18n/`, `src/styles/`, `src/app/`, `src/env.ts`, `src/proxy.ts`, and `src/shared/config/` as app-internal modules.
3. THE Portal_App SHALL retain `src/shared/security/`, `src/shared/dev-tools/`, `src/shared/next-config/`, `src/shared/feed/`, and `src/shared/wiki/` as app-internal modules.
4. WHEN the Portal_App is moved, THE `@/` path alias inside `apps/portal/` SHALL resolve to `apps/portal/src/` for app-internal imports.
5. THE Portal_App SHALL contain a package-level `turbo.json` that overrides `type-check` and `build` to depend on `typegen`.

### Requirement 8: Docker Build Support

**User Story:** As a DevOps engineer, I want the Docker build updated for the monorepo structure, so that production images are built efficiently with proper layer caching.

#### Acceptance Criteria

1. THE Containerfile SHALL use `turbo prune @portal/portal --docker` to generate a minimal workspace subset for the Docker build context.
2. THE Containerfile SHALL use a multi-stage build with separate pruner, deps, builder, and runner stages.
3. WHEN the Docker image is built, THE runner stage SHALL contain only the standalone Next.js output, static assets, and public files — no source code or dev dependencies.
4. THE Containerfile SHALL maximize layer caching by installing dependencies from the pruned `package.json` files before copying full source.
5. THE Docker image SHALL include a health check that verifies the `/api/health` endpoint responds with HTTP 200.
6. WHEN the Docker image is built from the monorepo, THE image SHALL produce identical runtime behavior to the current single-app Docker image.

### Requirement 9: CI/CD Pipeline Updates

**User Story:** As a developer, I want the CI/CD pipeline updated to leverage Turborepo caching and monorepo-aware change detection, so that CI runs are faster and only affected packages are checked.

#### Acceptance Criteria

1. WHEN the CI pipeline detects file changes, THE change detection patterns SHALL include both `apps/portal/src/**` and `packages/*/src/**` paths.
2. THE CI pipeline SHALL use `turbo run` for lint, type-check, build, and test jobs.
3. WHEN caching the Next.js build, THE CI pipeline SHALL use the updated path `apps/portal/.next/cache`.
4. WHEN uploading test coverage, THE CI pipeline SHALL reference the updated path `apps/portal/coverage/lcov.info`.
5. THE CI pipeline SHALL run `pnpm typegen` before `pnpm type-check` to generate Next.js RouteContext types.

### Requirement 10: Incremental Migration Safety

**User Story:** As a developer, I want the migration to be incremental and non-breaking, so that the application continues to work at every step and I can verify correctness progressively.

#### Acceptance Criteria

1. WHEN each migration phase is completed, THE Portal_App SHALL pass `pnpm install` without errors.
2. WHEN each Internal_Package is extracted, THE Portal_App SHALL pass `pnpm type-check` without new errors.
3. WHEN the full migration is completed, THE Portal_App SHALL pass `pnpm build` from the Monorepo_Root.
4. WHEN the full migration is completed, all existing tests SHALL pass (excluding the 2 known pre-existing `vi.mock` hoisting failures).
5. WHEN the full migration is completed, THE Portal_App SHALL produce identical route responses given the same request and database state as the pre-migration single-app build.

### Requirement 11: Tooling Preservation

**User Story:** As a developer, I want existing development tooling (Husky, lint-staged, commitlint, semantic-release, shadcn CLI) to continue working after the migration, so that my workflow is not disrupted.

#### Acceptance Criteria

1. THE Monorepo_Root SHALL retain Husky git hooks, lint-staged, and commitlint configuration at the root level.
2. WHEN `pnpm fix` is run, THE Workspace SHALL execute `ultracite fix` (not raw `biome fix`) across all packages via Turborepo.
3. WHEN the shadcn CLI is used to add a component, THE CLI SHALL write to the `@portal/ui` package at the correct path.
4. THE `semantic-release` configuration SHALL continue to function for the Portal_App release process.
5. WHEN database scripts (`db:generate`, `db:migrate`, `db:push`, `db:studio`) are run from the Monorepo_Root, THE scripts SHALL be scoped to the correct package (`@portal/db` or Portal_App).
6. WHEN `tsx`-based scripts (`db:wipe`, `db:seed`, `create-admin`) are run, THE scripts SHALL execute from `apps/portal/scripts/` with correct relative paths.

### Requirement 12: Environment Variable Management

**User Story:** As a developer, I want environment variables properly managed in the monorepo, so that builds are reproducible and env changes correctly invalidate caches.

#### Acceptance Criteria

1. THE `.env` file SHALL reside in `apps/portal/` to make ownership clear for the single-app monorepo.
2. WHEN an environment variable is read at build time by any package, THE variable SHALL be declared in the corresponding task's `env` array in `turbo.json`.
3. THE `turbo.json` SHALL declare `NODE_ENV` as a global environment variable.
4. WHEN `.env` or `.env.*` files change, THE Task_Pipeline SHALL invalidate the cache for `build` and `test` tasks.
5. WHEN a package uses `@t3-oss/env-nextjs` for environment validation via a `keys()` function, THE package SHALL NOT access `process.env` directly outside of the `keys()` function.

### Requirement 13: Package Security and Isolation

**User Story:** As a developer, I want internal packages to be private and properly isolated, so that they cannot be accidentally published and their boundaries are enforced.

#### Acceptance Criteria

1. THE Internal_Package `package.json` SHALL set `"private": true` to prevent accidental publishing to npm.
2. WHEN a file in an Internal_Package imports from another Internal_Package, THE import SHALL go through the package's `exports` field, not via direct file path references.
3. THE Internal_Package SHALL NOT import from the `@/` app-internal alias.
4. WHEN the `turbo.json` `env` array is configured, THE array SHALL be a superset of all environment variables actually read at build time by the corresponding task, preventing undeclared variables from silently affecting build output.

### Requirement 14: Error Recovery

**User Story:** As a developer, I want clear error handling for common monorepo issues, so that I can quickly diagnose and fix problems.

#### Acceptance Criteria

1. IF a circular dependency is detected between Internal_Packages, THEN THE Workspace SHALL report the cycle via `pnpm` or Turborepo error output.
2. IF an import references a symbol not listed in an Internal_Package's `exports` field, THEN TypeScript SHALL report a "Cannot find module" error at type-check time.
3. IF `next typegen` has not been run before `type-check`, THEN THE Portal_App's `turbo.json` SHALL ensure `typegen` runs first via the task dependency.
4. IF `turbo prune` fails to include a required package, THEN THE Docker build SHALL fail at the COPY stage with a clear missing-file error.
