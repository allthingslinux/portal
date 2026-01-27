import type { RouteTranslationResolver } from "./i18n";
import { getTranslatedRouteConfig } from "./i18n";
import type { RouteConfig } from "./types";

/**
 * Get UI display values for a route
 * Falls back to metadata if UI display not provided
 *
 * @param pathname - The pathname to look up
 * @param config - The route configuration
 * @param resolver - Optional translation resolver for i18n support
 */
export function getUIDisplay(
  pathname: string,
  config: RouteConfig,
  resolver?: RouteTranslationResolver
): { title?: string; description?: string } {
  const cleanPath = pathname.split("?")[0].split("#")[0];

  // Resolve translations if resolver provided
  const resolvedConfig = resolver
    ? getTranslatedRouteConfig(config, resolver)
    : config;

  // Find route in config
  const allRoutes = [...resolvedConfig.public, ...resolvedConfig.protected];
  const route = allRoutes.find((r) => r.path === cleanPath);

  if (!route) {
    return { title: undefined, description: undefined };
  }

  // Use UI display if provided, otherwise fall back to metadata
  return {
    title: route.ui?.title ?? route.metadata.title,
    description: route.ui?.description ?? route.metadata.description,
  };
}
