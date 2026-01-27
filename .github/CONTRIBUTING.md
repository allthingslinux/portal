# Contributing to Portal

Thank you for your interest in contributing to Portal! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js >= 22.18.0 (LTS recommended)
- pnpm 10.27.0
- PostgreSQL database (PostgreSQL 18 recommended)
- Docker and Docker Compose (for local database setup)

### Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/your-username/portal.git
cd portal
```

1. **Install dependencies**

```bash
pnpm install
```

1. **Set up environment variables**

Create a `.env` file with your configuration. See the main README for required variables.

1. **Start the database**

```bash
docker compose up -d portal-db
```

1. **Run database migrations**

```bash
pnpm db:migrate
```

1. **Create an admin user (optional)**

```bash
pnpm create-admin
```

1. **Start the development server**

```bash
pnpm dev
```

## Development Workflow

### Code Style

- **TypeScript**: Strict mode enabled, use explicit types
- **Formatting**: Biome handles formatting (run `pnpm fix`)
- **Linting**: Ultracite enforces code quality (run `pnpm check`)
- **Imports**: Use TypeScript path aliases (`@/auth`, `@/db`, etc.)
- **Quotes**: Single quotes, no semicolons (Biome config)

### Git Workflow

1. **Create a branch** from `main`

**Branch Naming Convention:**

Use the format: `<type>/<short-description>`

```bash
# Feature branch
git checkout -b feat/user-profile-page

# Bug fix branch
git checkout -b fix/auth-redirect-issue

# Documentation branch
git checkout -b docs/api-updates

# Refactoring branch
git checkout -b refactor/db-queries
```

**Branch Types:**
- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks
- `ci/` - CI/CD changes

1. **Make your changes** following the code style guidelines

2. **Run checks** before committing

```bash
pnpm check
pnpm type-check
pnpm test
```

1. **Commit your changes** using [Conventional Commits](https://www.conventionalcommits.org/)

**Commit Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Commit Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes (dependencies, etc.)
- `revert`: Revert a previous commit

**Commit Message Examples:**

```bash
# Simple commit (most common)
git commit -m "feat: add user profile page"
git commit -m "fix: resolve authentication redirect issue"
git commit -m "docs: update API documentation"

# With scope (optional but recommended)
git commit -m "feat(auth): add OAuth2 provider support"
git commit -m "fix(api): handle null user sessions"
git commit -m "refactor(db): optimize user query performance"

# With body (for complex changes)
git commit -m "feat(integrations): add XMPP integration

- Implement BaseIntegration interface
- Add XMPP configuration and keys
- Register integration in registry
- Add integration management UI

Closes #123"

# Breaking changes (triggers major version bump)
git commit -m "feat(api): change user endpoint response format

BREAKING CHANGE: User endpoint now returns nested user object instead of flat structure"
```

**Commit Message Rules:**

- Use imperative mood ("add" not "added" or "adds")
- First line should be 72 characters or less
- Capitalize first letter of subject
- No period at the end of subject
- Reference issues/PRs in footer: `Closes #123` or `Fixes #456`
- Use scope to indicate affected module (optional but recommended)

1. **Push your branch**

```bash
git push origin feat/your-feature-name
```

1. **Create a Pull Request** using the PR template

### Pre-commit Hooks

Husky runs pre-commit hooks automatically:

- **Linting and formatting** via `lint-staged` (runs only on changed files)
- **Commit message validation** via `commitlint` (enforces conventional commits)

**What runs on pre-commit:**

- Biome formatting and linting on staged files only
- Fast checks (< 5 seconds) to avoid slowing down commits
- Type checking is skipped in pre-commit (runs in CI)

**If pre-commit fails:**

- Fix the issues shown in the error output
- Stage your fixes: `git add .`
- Commit again: `git commit -m "your message"`

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Place test files next to the code they test (e.g., `utils.test.ts` next to `utils.ts`)
- Use Vitest for unit and integration tests
- Use React Testing Library for component tests
- See `docs/TESTING.md` for detailed testing patterns

### Test Coverage

- Aim for 70%+ coverage on new code
- Critical paths (auth, API routes, integrations) should have higher coverage
- Focus on testing business logic, not implementation details

## Code Quality

### Linting and Formatting

```bash
# Check for issues
pnpm check

# Auto-fix issues
pnpm fix
```

### Type Checking

```bash
# Type check without building
pnpm type-check
```

### Build Verification

```bash
# Ensure the project builds successfully
pnpm build
```

## Pull Request Process

1. **Update documentation** if you've changed functionality
2. **Add tests** for new features or bug fixes
3. **Ensure all checks pass** (lint, type-check, build, tests)
4. **Fill out the PR template** completely
5. **Use a conventional commit title** for your PR (validated automatically)
6. **Request review** from maintainers

**PR Title Format:**

PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>
```

**Examples:**

- `feat: add user profile page`
- `fix(auth): resolve session expiration issue`
- `docs: update API documentation`
- `refactor(db): optimize query performance`
- `feat!: breaking change` (use `!` for breaking changes in PR titles)

**Work-in-Progress PRs:**

For work-in-progress PRs, you can use the `[WIP]` prefix:

- `[WIP] feat: add user profile page`

This will skip validation and keep the check in a pending state until the `[WIP]` prefix is removed.

**Note:** PR titles are automatically validated. If your PR title doesn't match the convention, the PR cannot be merged.

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review performed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated and passing
- [ ] All CI checks passing
- [ ] No breaking changes (or documented if intentional)

## Releases

Portal uses [semantic-release](https://semantic-release.gitbook.io/semantic-release/) for automated version management and GitHub releases.

### How Releases Work

1. **Commits follow Conventional Commits** (enforced by commitlint)
2. **On merge to `main`**, semantic-release automatically:
   - Analyzes commits since last release
   - Determines next semantic version
   - Generates changelog
   - Creates GitHub release
   - Updates `package.json` version

### Release Types

- **Patch Release** (1.0.0 → 1.0.1): `fix:` commits
- **Minor Release** (1.0.0 → 1.1.0): `feat:` commits
- **Major Release** (1.0.0 → 2.0.0): Commits with `BREAKING CHANGE:` footer

### Skipping a Release

To skip a release for a specific commit, add `[skip ci]` to the commit message:

```bash
git commit -m "chore: update dependencies [skip ci]"
```

### Changelog

The `CHANGELOG.md` file is automatically generated and updated by semantic-release. Do not edit it manually.

## Architecture Guidelines

### Module Organization

- **`src/lib/`**: Core business logic (auth, db, integrations)
- **`src/components/`**: Reusable React components
- **`src/hooks/`**: Custom React hooks
- **`src/app/`**: Next.js App Router routes and API endpoints

### Server/Client Boundaries

- Mark server-only code with `"use server"` or `import "server-only"`
- Keep client components minimal and focused on UI
- Move business logic to server actions or API routes

### API Design

- Use RESTful conventions
- Response format: `{ ok: true, data }` or `{ ok: false, error }`
- Use `handleAPIError()` for consistent error handling
- Use auth guards: `requireAuth()`, `requireAdmin()`, `requireAdminOrStaff()`

### Database

- Use Drizzle ORM for type-safe queries
- Create migrations for schema changes: `pnpm db:generate`
- Run migrations: `pnpm db:migrate`
- Use DTOs to prevent exposing sensitive data

## Questions?

- Check the [README.md](./README.md) for project overview
- Review [docs/TESTING.md](./docs/TESTING.md) for testing patterns
- Review [docs/COMPONENTS.md](./docs/COMPONENTS.md) for component conventions
- Open an issue for questions or clarifications

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow

Thank you for contributing to Portal! 🚀
