# Path alias usage and recommendations

## Current aliases (tsconfig.json)

| Alias        | Target                   | Usage                |
|-------------|---------------------------|----------------------|
| `@/auth`    | `src/features/auth/lib`   | **Used**             |
| `@/auth/*`  | `src/features/auth/lib/*` | **Used**             |
| `@/db`      | `src/shared/db`           | **Used**             |
| `@/db/*`    | `src/shared/db/*`        | **Used**             |
| `@/config`  | `src/shared/config`       | **Used**             |
| `@/config/*`| `src/shared/config/*`     | **Used**             |
| `@/ui/*`    | `src/components/ui/*`    | **Used** – e.g. `@/ui/button` |
| `@/*`       | `src/*`                   | **Used** – catch-all |

## Optional aliases to add later

| Proposed alias   | Target                         | Rationale |
|------------------|---------------------------------|-----------|
| `@/routes`       | `src/features/routing/lib`      | ~24 imports across 19 files; short and clear. |
| `@/integrations` | `src/features/integrations/lib` | ~17 imports across 12 files; mirrors `@/auth` pattern. |

Avoid `@/api` for `src/shared/api` – it’s easy to confuse with the `app/api/` route group.
