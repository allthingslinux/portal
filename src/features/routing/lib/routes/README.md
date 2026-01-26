# Navigation i18n Integration

This document explains the cleanest way to integrate next-intl with the navigation configuration system.

## Overview

The route configuration stays **pure structure** - no translation keys needed! Translations are automatically resolved based on route IDs. This keeps your route config clean and maintainable.

## How It Works

1. **Route config stays pure** - Just structure, no translation keys
2. **Translations auto-resolved** - Based on route ID automatically
3. **Fallback to original** - If translation not found, uses original value (backward compatible)

## Translation Structure

Translations are organized by route ID in your locale file:

```json
{
  "routes": {
    "home": {
      "label": "Home",
      "metadata": {
        "title": "Home",
        "description": "Welcome to Portal"
      }
    },
    "dashboard": {
      "label": "Dashboard",
      "metadata": {
        "title": "Dashboard",
        "description": "Your dashboard overview"
      },
      "ui": {
        "title": "Dashboard",
        "description": "Your dashboard overview"
      },
      "breadcrumb": {
        "label": "Overview"
      }
    },
    "projects": {
      "label": "Projects",
      "navigation": {
        "children": {
          "projects-all": {
            "label": "All Projects"
          }
        }
      }
    },
    "group": {
      "platform": {
        "label": "Platform"
      }
    },
    "footer": {
      "support": {
        "label": "Support"
      }
    }
  }
}
```

## Usage

### Server Components

```typescript
import { getServerRouteResolver } from "@/lib/routes";
import { routeConfig } from "@/lib/routes";
import { getRouteMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app", routeConfig, resolver);
}
```

### Client Components

```typescript
"use client";
import { useTranslatedRoutes } from "@/hooks/use-translated-routes";
import { getNavigationItems } from "@/lib/routes";

export function Sidebar() {
  const translatedConfig = useTranslatedRoutes();
  const navigationItems = getNavigationItems(translatedConfig, permissions);
  // ...
}
```

### Page Header Component

```typescript
import { getServerRouteResolver } from "@/lib/routes";
import { getUIDisplay, routeConfig } from "@/lib/routes";

export default async function Page() {
  const resolver = await getServerRouteResolver();
  const { title, description } = getUIDisplay("/app", routeConfig, resolver);
  // ...
}
```

## Translation Key Format

Translations are automatically looked up using this pattern:

- `routes.{routeId}.label` → Route label
- `routes.{routeId}.metadata.title` → Metadata title
- `routes.{routeId}.metadata.description` → Metadata description
- `routes.{routeId}.ui.title` → UI title
- `routes.{routeId}.ui.description` → UI description
- `routes.{routeId}.breadcrumb.label` → Breadcrumb label
- `routes.group.{groupId}.label` → Navigation group label
- `routes.footer.{actionId}.label` → Footer action label

## Benefits

1. **Clean Route Config** - No translation keys cluttering the config
2. **Automatic Resolution** - Translations resolved by route ID
3. **Backward Compatible** - Falls back to original values if translation missing
4. **Type Safe** - Route IDs are validated
5. **Centralized** - All route translations in `Routes` namespace
6. **No Boilerplate** - No need to manually add translation keys to config

## Migration

Your existing route config works as-is! Just add translations to the locale file and pass a resolver to helper functions. The system will automatically use translations when available, and fall back to original values otherwise.

# Using Routes with Translations

This guide explains how to use the route configuration with translations from your locale files.

## Overview

Your route config (`src/lib/routes/config.ts`) defines the structure, and your locale file (`locale/en.json`) provides the translations. The system automatically connects them using route IDs.

## How It Works

1. **Route Config** - Pure structure with route IDs (e.g., `id: "dashboard"`)
2. **Locale Files** - Translations organized by route ID (e.g., `routes.dashboard.label`)
3. **Automatic Resolution** - Helper functions resolve translations when you pass a resolver

## Usage Examples

### Client Components

Use the `useTranslatedRoutes()` hook to get a translated route config:

```tsx
"use client";
import { useTranslatedRoutes } from "@/hooks/use-translated-routes";
import { getNavigationItems } from "@/lib/routes";

export function Sidebar() {
  // Get translated route config (automatically resolves from locale file)
  const translatedConfig = useTranslatedRoutes();
  const navigationItems = getNavigationItems(translatedConfig, permissions);
  // ...
}
```

### Server Components

Use `getServerRouteResolver()` to get a resolver, then pass it to helper functions:

```tsx
import { getServerRouteResolver } from "@/lib/routes";
import { getRouteMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app", routeConfig, resolver);
}
```

### PageHeader Component

The `PageHeader` component accepts an optional `resolver` prop:

**Server Component:**
```tsx
export default async function Page() {
  const resolver = await getServerRouteResolver();
  return <PageHeader pathname="/app" resolver={resolver} />;
}
```

**Client Component:**
```tsx
"use client";
import { useTranslatedRoutes } from "@/hooks/use-translated-routes";

export function Component() {
  const translatedConfig = useTranslatedRoutes();
  const route = translatedConfig.protected.find(r => r.path === "/app");
  return <PageHeader title={route?.ui?.title} description={route?.ui?.description} />;
}
```

## Translation Structure

Your locale file should have translations organized like this:

```json
{
  "Routes": {
    "dashboard": {
      "label": "Dashboard",
      "metadata": {
        "title": "Dashboard",
        "description": "Your dashboard overview"
      },
      "ui": {
        "title": "Dashboard",
        "description": "Your dashboard overview"
      },
      "breadcrumb": {
        "label": "Overview"
      }
    }
  }
}
```

## Helper Functions

All these functions accept an optional `resolver` parameter:

- `getRouteMetadata(pathname, config, resolver?)` - For SEO metadata
- `getUIDisplay(pathname, config, resolver?)` - For page headers
- `getNavigationItems(config, permissions, resolver?)` - For sidebar navigation
- `getFooterActions(config, permissions, resolver?)` - For footer actions

## Current Implementation

✅ **Already Using Translations:**
- `SidebarContainer` - Uses `useTranslatedRoutes()` hook
- Page metadata - Uses `getServerRouteResolver()` in `generateMetadata()`
- `PageHeader` - Accepts optional `resolver` prop

The translations are automatically resolved from your `locale/en.json` file based on route IDs!
