import { captureException } from "@sentry/nextjs";

import type { RouteConfig } from "./types";

/**
 * Translation function type for resolving route translations
 * Takes a route ID and a translation key path (e.g., "label", "metadata.title")
 */
export type RouteTranslationResolver = (
  routeId: string,
  key: string,
  params?: Record<string, unknown>
) => string | undefined;

/**
 * Resolve a translation for a route field
 * Requires translation to exist - no fallback to config value
 */
function resolveRouteTranslation(
  routeId: string,
  field: string,
  resolver: RouteTranslationResolver
): string | undefined {
  // Try to resolve translation
  const translated = resolver(routeId, field);
  if (translated) {
    return translated;
  }

  // No fallback - translation is required
  // This ensures all display strings come from locale files
  return undefined;
}

/**
 * Get translated route config
 * Automatically resolves translations based on route ID
 *
 * @example
 * ```typescript
 * // Translation structure in locale file (routes.json):
 * // {
 * //   "routes": {
 * //     "home": { "label": "Home", "metadata": { "title": "Home" } },
 * //     "dashboard": { "label": "Dashboard", "ui": { "title": "Dashboard" } }
 * //   }
 * // }
 *
 * // Usage with dot notation:
 * const t = useTranslations(); // or getTranslations() for server
 * const resolver = createRouteTranslationResolver(t);
 * const translated = getTranslatedRouteConfig(routeConfig, resolver);
 * // Resolver constructs keys like: routes.home.label, routes.dashboard.ui.title
 * ```
 */
export function getTranslatedRouteConfig(
  config: RouteConfig,
  resolver: RouteTranslationResolver
): RouteConfig {
  return {
    ...config,
    public: config.public.map((route) => {
      const label = resolveRouteTranslation(route.id, "label", resolver);
      const title = resolveRouteTranslation(
        route.id,
        "metadata.title",
        resolver
      );
      const description = resolveRouteTranslation(
        route.id,
        "metadata.description",
        resolver
      );
      const breadcrumbLabel = route.breadcrumb
        ? resolveRouteTranslation(route.id, "breadcrumb.label", resolver)
        : undefined;

      return {
        ...route,
        ...(label ? { label } : {}),
        metadata: {
          ...route.metadata,
          ...(title ? { title } : {}),
          ...(description ? { description } : {}),
        },
        breadcrumb: route.breadcrumb
          ? {
              ...route.breadcrumb,
              ...(breadcrumbLabel ? { label: breadcrumbLabel } : {}),
            }
          : undefined,
      };
    }),
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: TODO
    protected: config.protected.map((route) => {
      const label = resolveRouteTranslation(route.id, "label", resolver);
      const title = resolveRouteTranslation(
        route.id,
        "metadata.title",
        resolver
      );
      const description = resolveRouteTranslation(
        route.id,
        "metadata.description",
        resolver
      );
      const uiTitle = route.ui
        ? resolveRouteTranslation(route.id, "ui.title", resolver)
        : undefined;
      const uiDescription = route.ui
        ? resolveRouteTranslation(route.id, "ui.description", resolver)
        : undefined;
      const breadcrumbLabel = route.breadcrumb
        ? resolveRouteTranslation(route.id, "breadcrumb.label", resolver)
        : undefined;

      return {
        ...route,
        ...(label ? { label } : {}),
        metadata: {
          ...route.metadata,
          ...(title ? { title } : {}),
          ...(description ? { description } : {}),
        },
        ui: route.ui
          ? {
              ...route.ui,
              ...(uiTitle ? { title: uiTitle } : {}),
              ...(uiDescription ? { description: uiDescription } : {}),
            }
          : undefined,
        breadcrumb: route.breadcrumb
          ? {
              ...route.breadcrumb,
              ...(breadcrumbLabel ? { label: breadcrumbLabel } : {}),
            }
          : undefined,
        navigation: route.navigation
          ? {
              ...route.navigation,
              children: route.navigation.children?.map((child) => {
                const childLabel = resolveRouteTranslation(
                  child.id,
                  "label",
                  resolver
                );
                const childBreadcrumbLabel = child.breadcrumb
                  ? resolveRouteTranslation(
                      child.id,
                      "breadcrumb.label",
                      resolver
                    )
                  : undefined;

                return {
                  ...child,
                  ...(childLabel ? { label: childLabel } : {}),
                  breadcrumb: child.breadcrumb
                    ? {
                        ...child.breadcrumb,
                        ...(childBreadcrumbLabel
                          ? { label: childBreadcrumbLabel }
                          : {}),
                      }
                    : undefined,
                };
              }),
            }
          : undefined,
      };
    }),
    navigationGroups: config.navigationGroups.map((group) => {
      const groupLabel = resolveRouteTranslation(
        `group.${group.id}`,
        "label",
        resolver
      );
      return {
        ...group,
        ...(groupLabel ? { label: groupLabel } : {}),
      };
    }),
    footerActions: config.footerActions.map((action) => {
      const actionLabel = resolveRouteTranslation(
        `footer.${action.id}`,
        "label",
        resolver
      );
      const actionTitle = action.metadata
        ? resolveRouteTranslation(
            `footer.${action.id}`,
            "metadata.title",
            resolver
          )
        : undefined;
      const actionDescription = action.metadata
        ? resolveRouteTranslation(
            `footer.${action.id}`,
            "metadata.description",
            resolver
          )
        : undefined;

      return {
        ...action,
        ...(actionLabel ? { label: actionLabel } : {}),
        metadata: action.metadata
          ? {
              ...action.metadata,
              ...(actionTitle ? { title: actionTitle } : {}),
              ...(actionDescription ? { description: actionDescription } : {}),
            }
          : undefined,
      };
    }),
  };
}

/**
 * Create a route translation resolver from next-intl's translation function
 * Automatically constructs translation keys like "routes.{routeId}.{key}"
 */
export function createRouteTranslationResolver(
  t: (key: string, params?: Record<string, string | number | Date>) => string
): RouteTranslationResolver {
  return (routeId: string, key: string, params?: Record<string, unknown>) => {
    // Construct translation key: routes.{routeId}.{key}
    // e.g., routes.home.label, routes.dashboard.metadata.title
    const translationKey = `routes.${routeId}.${key}`;

    try {
      // Convert params to the format next-intl expects
      const nextIntlParams = params
        ? (Object.fromEntries(
            Object.entries(params).filter(
              ([, value]) =>
                typeof value === "string" ||
                typeof value === "number" ||
                value instanceof Date
            )
          ) as Record<string, string | number | Date>)
        : undefined;

      const translated = t(translationKey, nextIntlParams);
      // If translation exists and is not the key itself, return it
      if (translated && translated !== translationKey) {
        return translated;
      }
    } catch (error) {
      // Translation not found - capture to Sentry for monitoring
      // Only capture if it's a missing message error (not other translation errors)
      if (
        error instanceof Error &&
        (error.message.includes("MISSING_MESSAGE") ||
          error.message.includes("Could not resolve"))
      ) {
        captureException(error, {
          tags: {
            type: "missing_translation",
            routeId,
            translationKey,
          },
          level: "warning", // Missing translations are warnings, not errors
        });
      } else {
        // For other errors, still capture but as error level
        captureException(error, {
          tags: {
            type: "translation_error",
            routeId,
            translationKey,
          },
        });
      }
      // Return undefined to fall back to original
    }

    return undefined;
  };
}

// Backward compatibility alias
export type TranslationResolver = RouteTranslationResolver;
