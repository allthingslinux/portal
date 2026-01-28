# Portal documentation

This directory holds project documentation. Use it as the single source of truth for architecture, APIs, and conventions.

## Docs index

| Document | Description |
|----------|--------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Module boundaries, server/client separation, data fetching & RSC, integration framework, API conventions, auth guards, feature modules, database conventions |
| [API.md](./API.md) | REST API endpoints, request/response formats, authentication, route param validation |
| [ACCESSIBILITY.md](./ACCESSIBILITY.md) | ARIA patterns, keyboard navigation, screen reader testing, color contrast, WCAG 2.1 AA |
| [CI_CD.md](./CI_CD.md) | GitHub Actions, PR title validation, Renovate, semantic-release, deployment, quality gates |
| [COMPONENTS.md](./COMPONENTS.md) | Component structure, base components (shadcn/ui), patterns, naming |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploying to Hetzner VPS, Cloudflare, Docker, environment variables |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | Integrations framework, adding new integrations, DB schema, types |
| [LOGGING.md](./LOGGING.md) | Wide-events pattern, observability, structured logging |
| [PATH_ALIASES.md](./PATH_ALIASES.md) | TypeScript path aliases (`@/auth`, `@/db`, etc.) and targets |
| [TESTING.md](./TESTING.md) | Vitest, test organization, unit/component/hook patterns, mocking |
| [TSCONFIG.md](./TSCONFIG.md) | TypeScript configuration, compiler options, paths, include/exclude |
| [NUQS.md](./NUQS.md) | nuqs setup for type-safe URL search params (filters, pagination, tabs) |

## Cross-references

- **Import paths**: See [PATH_ALIASES.md](./PATH_ALIASES.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) (Module boundaries, Import patterns).
- **API route handlers**: [API.md](./API.md) for endpoints; [ARCHITECTURE.md](./ARCHITECTURE.md) for `@/shared/api/utils`, auth guards, and error handling.
- **Data fetching**: [ARCHITECTURE.md](./ARCHITECTURE.md) “Data Fetching & RSC”.
- **New integrations**: [INTEGRATIONS.md](./INTEGRATIONS.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) “Integration Framework”.
- **URL-backed filters / pagination**: [NUQS.md](./NUQS.md) (nuqs adapter, parsers, admin list filters).
