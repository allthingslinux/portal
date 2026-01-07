import type { RouteConfig } from "./types";

/**
 * Get UI display values for a route
 * Falls back to metadata if UI display not provided
 */
export function getUIDisplay(
  pathname: string,
  config: RouteConfig,
): { title?: string; description?: string } {
  const cleanPath = pathname.split("?")[0].split("#")[0];

  // Find route in config
  const allRoutes = [...config.public, ...config.protected];
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
