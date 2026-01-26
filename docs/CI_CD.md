# CI/CD Documentation

This document describes Portal's continuous integration and deployment setup.

## GitHub Actions Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every pull request and push to `main` branch.

**Jobs:**

- **lint**: Runs Biome linting and formatting checks
- **type-check**: Runs TypeScript type checking
- **build**: Builds the Next.js application
- **test**: Runs test suite with coverage reporting

### PR Title Validation (`.github/workflows/pr-title.yml`)

Validates that pull request titles follow Conventional Commits format.

**Features:**

- Enforces conventional commit types (feat, fix, docs, etc.)
- Validates subject format (no uppercase start)
- Blocks merge if title doesn't match convention
- Supports `[WIP]` prefix for work-in-progress PRs
- Works with fork-based workflows (uses `pull_request_target`)
- Helps ensure semantic-release can properly analyze PRs

**Valid PR Title Examples:**

- `feat: add user profile page`
- `fix(auth): resolve session expiration issue`
- `docs: update API documentation`
- `refactor(db): optimize query performance`
- `feat!: breaking change` (use `!` for breaking changes in PR titles)
- `[WIP] feat: work in progress` (skips validation, keeps check pending)

**Configuration:**

- Uses `pull_request_target` event for better security and fork support
- Validates on: opened, reopened, edited, synchronize
- Requires PR titles to match commitlint configuration

### Dependency Review (`.github/workflows/dependency-review.yml`)

Automatically reviews dependency changes in pull requests.

**Features:**

- Scans for security vulnerabilities in new dependencies
- Checks for problematic licenses (GPL, AGPL)
- Fails PRs with moderate or higher severity vulnerabilities
- Provides security insights before merging

**Configuration:**

- Fails on: Moderate severity or higher
- Denied licenses: GPL-2.0, GPL-3.0, AGPL-1.0, AGPL-3.0

**Coverage:**

- Coverage reports are uploaded to Codecov (if `CODECOV_TOKEN` is configured)
- Coverage thresholds: 40% minimum (lines, functions, branches, statements)
- Target: 70%+ for new code

### Renovate Configuration (`renovate.json`)

Automatically creates pull requests for dependency updates using Renovate.

**Features:**

- Weekly dependency updates (Monday mornings)
- Groups updates by type (production, development, GitHub Actions, Docker)
- Auto-merges minor/patch updates when CI passes
- Manual review required for major updates
- Uses conventional commits
- Dependency dashboard for tracking updates

**Configuration:**

- Config file: `renovate.json`
- Schedule: Monday before 10am UTC
- Auto-merge: Enabled for minor/patch updates
- Reviewers: AllThingsLinux team
- Labels: Applied automatically based on update type

### Renovate Auto-merge Workflow (`.github/workflows/renovate-auto-merge.yml`)

Automatically tests and merges Renovate PRs when all checks pass.

**Features:**

- Runs full CI suite on dependency updates
- Auto-merges when checks pass and PR has `automerge` label
- Only runs for Renovate PRs

### Release Job (in CI Workflow)

Automated version management and GitHub releases using semantic-release.

**Trigger:**

- Runs as part of CI workflow on push to `main` branch
- Only runs after all CI checks pass (lint, type-check, build, test)
- Skips if commit message contains `[skip ci]`
- Does not run on pull requests

**Features:**

- Analyzes commits since last release
- Determines next semantic version (major/minor/patch)
- Generates changelog
- Creates GitHub release
- Updates `package.json` version
- Commits changelog and version updates

**Release Types:**

- `fix:` → Patch release (1.0.0 → 1.0.1)
- `feat:` → Minor release (1.0.0 → 1.1.0)
- `BREAKING CHANGE:` → Major release (1.0.0 → 2.0.0)

**Configuration:**

- Config file: `.releaserc.json`
- Uses conventional commits (enforced by commitlint)
- Creates `CHANGELOG.md` automatically
- Commits `package.json` version and `CHANGELOG.md` updates (via `@semantic-release/git`)

**Note on Committing Changes:**

This project commits both `package.json` version and `CHANGELOG.md` during releases. While this adds complexity (requires proper branch protection configuration), it's beneficial for:
- Visibility: Contributors can see the current version in the repository
- Documentation: `CHANGELOG.md` provides a local reference for changes
- GitHub-only releases: Since we're not publishing to npm, committing these files provides better visibility

See [semantic-release FAQ](https://semantic-release.gitbook.io/semantic-release/support/faq) for more details on the trade-offs.

**Plugins:**

- `@semantic-release/commit-analyzer` - Analyzes conventional commits (default plugin)
- `@semantic-release/release-notes-generator` - Generates release notes (default plugin)
- `@semantic-release/changelog` - Creates `CHANGELOG.md` (installed as dev dependency)
- `@semantic-release/git` - Commits changelog and version updates (installed as dev dependency)
- `@semantic-release/exec` - Creates and finalizes Sentry releases (installed as dev dependency)
  - Creates Sentry release during prepare step
  - Finalizes release and associates commits during publish step
  - Non-blocking: fails gracefully if Sentry is not configured
- `@semantic-release/github` - Creates GitHub releases (default plugin)
- `semantic-release-major-tag` - Creates/updates major version tags (installed as dev dependency)
  - Creates `v2` tag when releasing `v2.0.0`
  - Updates `v2` tag to point to latest `2.x.x` release
  - Useful for quick reference to latest version in a major line

**Job Dependencies:**

The release job depends on all other CI jobs:
- `lint` - Must pass
- `type-check` - Must pass
- `build` - Must pass
- `test` - Must pass

This ensures releases only happen when all quality gates pass.

### Deploy Workflow (`.github/workflows/deploy.yml`)

Manual deployment workflow for staging and production environments.

**Usage:**

- Trigger via GitHub Actions UI: "Run workflow"
- Select environment: `staging` or `production`
- Or push to `main` branch (deploys to staging)

**Steps:**

1. Install dependencies
2. Type check
3. Build application
4. Deploy to Vercel (if configured)
5. Run database migrations (production only)

## Quality Gates

### Branch Protection Rules

Configure in GitHub repository settings: `Settings > Branches > Branch protection rules`

**Recommended Settings:**

1. **Require status checks to pass before merging**
   - Required checks:
     - `lint`
     - `type-check`
     - `build`
     - `test`
     - `validate-pr-title` (PR title validation)
     - `dependency-review` (dependency security review)
   - **Note:** Do not include `release` in required checks, as it only runs on pushes to `main` (not on pull requests)

2. **Require pull request reviews before merging**
   - Required reviewers: 1
   - Dismiss stale reviews when new commits are pushed: ✅

3. **Require conversation resolution before merging**: ✅

4. **Require linear history**: Optional

5. **Do not allow bypassing the above settings**: ✅ (for admins)

**Setup Instructions:**

1. Go to repository Settings
2. Navigate to "Branches"
3. Click "Add rule" or edit existing rule for `main` branch
4. Configure the settings above
5. Save changes

**Note on Branch Protection and Releases:**

The release job uses the automatically populated `GITHUB_TOKEN` to commit changes (changelog and version updates). If branch protection is enabled, ensure that:

- The `GITHUB_TOKEN` has sufficient permissions (configured via workflow `permissions`)
- The release job is not included in required status checks (it only runs on pushes to `main`, not on PRs)
- Branch protection may need to allow the `GITHUB_TOKEN` to bypass restrictions for automated commits
- Pre-commit hooks (like commitlint via husky) should be disabled for automated commits to avoid conflicts
- If you need to use a Personal Access Token instead, set `persist-credentials: false` in the checkout step and use a custom token (see [semantic-release GitHub Actions docs](https://semantic-release.gitbook.io/semantic-release/recipes/ci-configurations#github-actions) for details)

**Important:** Committing during releases adds complexity. See [semantic-release FAQ](https://semantic-release.gitbook.io/semantic-release/support/faq#why-is-the-packagejsons-version-not-updated-in-my-repository) for details on the trade-offs.

### Coverage Thresholds

Coverage thresholds are enforced in `vitest.config.ts`:

```typescript
thresholds: {
  lines: 40,
  functions: 40,
  branches: 40,
  statements: 40,
}
```

**For New Code:**

- Target: 70%+ coverage
- Enforced via code review
- Use `pnpm test:coverage` to check locally

## Deployment

### Staging Deployment

- **Trigger**: Push to `main` branch or manual workflow dispatch
- **Environment**: Staging
- **URL**: Configured in Vercel project settings

### Production Deployment

- **Trigger**: Manual workflow dispatch only
- **Environment**: Production
- **Prerequisites**:
  - All CI checks passing
  - Code review approved
  - Database migrations reviewed

### Environment Variables

Required secrets in GitHub repository settings:

**For CI:**

- `CODECOV_TOKEN` (optional): Codecov token for coverage reporting

**For Releases:**

- `GITHUB_TOKEN` (automatic): Automatically populated by GitHub Actions for repository access
- `SENTRY_ORG` (optional): Sentry organization slug for release tracking
- `SENTRY_PROJECT` (optional): Sentry project slug for release tracking
- `SENTRY_AUTH_TOKEN` (optional): Sentry authentication token for release API

**Note:** The `GITHUB_TOKEN` is automatically provided by GitHub Actions and has the necessary permissions configured in the workflow. No manual setup required.

**For Deployment:**

- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID

**Environment-specific variables** are configured in Vercel dashboard:

- Staging environment variables
- Production environment variables

### Database Migrations

**Before Production Deployment:**

1. Review migration files in `drizzle/` directory
2. Test migrations on staging database
3. Backup production database
4. Run migrations: `pnpm db:migrate`
5. Verify migration success

**Migration Strategy:**

- Migrations run automatically in deploy workflow (production)
- Or run manually via deployment platform's CLI
- Always test migrations on staging first

## Local Testing

### Run CI Checks Locally

```bash
# Run all CI checks
pnpm check          # Lint
pnpm type-check     # Type check
pnpm build          # Build
pnpm test:coverage  # Tests with coverage
```

### Pre-commit Checks

Husky runs pre-commit hooks automatically:

- Linting and formatting (via lint-staged)
- Commit message validation (via commitlint)

## Troubleshooting

### CI Failures

**Lint Failures:**

```bash
pnpm fix  # Auto-fix issues
pnpm check  # Verify fixes
```

**Type Check Failures:**

```bash
pnpm type-check  # See detailed errors
```

**Build Failures:**

```bash
pnpm build  # Test build locally
```

**Test Failures:**

```bash
pnpm test  # Run tests locally
pnpm test:watch  # Watch mode for debugging
```

### Coverage Issues

**Low Coverage:**

- Add tests for uncovered code
- Focus on critical paths (auth, API routes, integrations)
- Use `pnpm test:coverage` to see detailed report

**Coverage Threshold Failures:**

- Review coverage report: `coverage/index.html`
- Add tests to increase coverage
- Adjust thresholds if needed (in `vitest.config.ts`)

## Best Practices

1. **Always run checks locally** before pushing
2. **Keep PRs small** for faster CI runs
3. **Fix CI failures immediately** - don't merge broken code
4. **Review coverage reports** before merging
5. **Test migrations** on staging before production
6. **Monitor deployments** after pushing to production

## Release Process

### Automated Releases

Portal uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/) for automated version management and GitHub releases.

**How It Works:**

1. Commits follow [Conventional Commits](https://www.conventionalcommits.org/) format (enforced by commitlint)
2. On push to `main`, semantic-release:
   - Analyzes commits since last release
   - Determines next version number
   - Generates changelog
   - Creates Sentry release (if configured)
   - Creates GitHub release
   - Updates `package.json` and commits changes
   - Finalizes Sentry release and associates commits (if configured)

**Commit Message Format:**

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

**Examples:**

- `fix(auth): resolve session expiration issue` → Patch release
- `feat(api): add user profile endpoint` → Minor release
- `feat(api): redesign authentication flow` + `BREAKING CHANGE: ...` → Major release

**Skipping Releases:**

Add `[skip ci]` to commit message to skip release:

```
chore: update dependencies [skip ci]
```

**Excluding Commits from Release Analysis:**

To exclude commits from version analysis (they won't affect the release type), add `[skip release]` or `[release skip]` to the commit message:

```
chore: update dependencies [skip release]
docs: update README [release skip]
```

**Note:** These commits will still be included in the release notes, but won't affect whether it's a patch, minor, or major release.

**Previewing Releases:**

To preview what version would be released without actually publishing, use the `--dry-run` option:

```bash
npx semantic-release@25 --dry-run
```

This will print the next version and release notes to the console without creating a release or committing changes.

### Manual Releases

If you need to create a release manually:

1. Create a tag: `git tag v1.0.0`
2. Push tag: `git push origin v1.0.0`
3. Create GitHub release from tag

**Note:** Manual releases bypass semantic-release. Use automated releases for consistency.

### Initial Version Setup

If you're setting up semantic-release for the first time:

1. **Current version** in `package.json` is `0.1.0`
2. **First release** will be determined by the first commit that triggers a release
3. **No initial tag needed** - semantic-release will start from the current version

If you had previous releases before setting up semantic-release, ensure the last release commit is tagged with `v{version}` (e.g., `v0.1.0`) matching the format in `.releaserc.json` (`tagFormat: "v${version}"`).

**Note on Initial Version:**

Semantic-release follows [Semantic Versioning](https://semver.org/) and does not support starting at `0.0.1`. The first release will be `1.0.0` (or higher based on commit types). If your project is under heavy development with frequent breaking changes, consider using [pre-releases](https://semantic-release.gitbook.io/semantic-release/recipes/release-workflow/pre-releases) instead.

### Branch Workflow

Currently configured for a simple single-branch workflow:

- **Release branch**: `main` - All releases are published from this branch
- **Distribution channel**: Default (GitHub releases)

**Future Extensibility:**

The workflow can be extended to support more complex release strategies:

- **Pre-release branches**: Add `beta` or `alpha` branches for pre-releases (e.g., `2.0.0-beta.1`)
  - Useful for testing major releases before general availability
  - See [Publishing pre-releases recipe](https://semantic-release.gitbook.io/semantic-release/recipes/release-workflow/pre-releases) for detailed examples

- **Maintenance branches**: Add version-specific branches (e.g., `1.x`, `1.0.x`) for maintaining older versions
  - Useful for backporting fixes to older versions
  - See [Publishing maintenance releases recipe](https://semantic-release.gitbook.io/semantic-release/recipes/release-workflow/maintenance-releases) for detailed examples

- **Multiple release branches**: Add a `next` branch for experimental releases on a separate distribution channel
  - Useful for making breaking changes available to early adopters
  - See [Publishing on distribution channels recipe](https://semantic-release.gitbook.io/semantic-release/recipes/release-workflow/distribution-channels) for detailed examples

**Example Extended Configuration:**

```json
{
  "branches": [
    "main",
    { "name": "beta", "prerelease": true },
    { "name": "alpha", "prerelease": true },
    "next",
    "+([0-9])?(.{+([0-9]),x}).x"
  ]
}
```

This configuration would enable:
- Regular releases from `main` (default channel)
- Pre-releases from `beta` and `alpha` branches
- Experimental releases from `next` branch
- Maintenance releases from version-specific branches (e.g., `1.x`, `1.0.x`)

See [semantic-release workflow configuration](https://semantic-release.gitbook.io/semantic-release/usage/workflow-configuration) for detailed documentation.

## Additional CI/CD Tools

### PR Title Validation

PR titles are automatically validated to ensure they follow Conventional Commits format. This helps:
- Ensure semantic-release can properly analyze merged PRs
- Maintain consistency across the project
- Prevent merge of PRs with invalid titles

**Configuration:** `.github/workflows/pr-title.yml`

### Branch Naming

While not enforced automatically, the project follows a branch naming convention:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks
- `ci/` - CI/CD changes

See `CONTRIBUTING.md` for more details.

### Why Not Changesets or release-please?

This project uses **semantic-release** instead of alternatives like Changesets or release-please because:

- **Semantic-release** analyzes commit messages directly (no manual changeset files needed)
- Works seamlessly with conventional commits (already enforced via commitlint)
- Automatically determines version based on commit types
- Simpler workflow: just write conventional commits, releases happen automatically
- Better for projects that want fully automated releases without manual intervention

**Changesets** would require:
- Manual creation of changeset files for each PR
- Additional PR step to add changeset
- More overhead for contributors

**release-please** would require:
- Manual version bump PRs
- Less automation than semantic-release
- More manual intervention

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments)
- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)
- [semantic-release Documentation](https://semantic-release.gitbook.io/semantic-release/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Pull Request Action](https://github.com/amannn/action-semantic-pull-request)
