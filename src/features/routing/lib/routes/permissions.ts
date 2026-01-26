import type { RouteTranslationResolver } from "./i18n";
import { getTranslatedRouteConfig } from "./i18n";
import type { Permission, UserPermissions } from "@/shared/types/auth";
import type { ProtectedRoute, RouteConfig } from "@/shared/types/routes";

// Re-export for backward compatibility
export type { Permission, UserPermissions } from "@/shared/types/auth";

/**
 * Check if user has required permission
 */
export function hasPermission(
  required: Permission | Permission[],
  userPermissions: UserPermissions
): boolean {
  const permissions = Array.isArray(required) ? required : [required];

  return permissions.every((permission) => {
    return userPermissions[permission] === true;
  });
}

/**
 * Filter routes based on user permissions
 */
export function filterRoutesByPermissions(
  routes: ProtectedRoute[],
  userPermissions: UserPermissions
): ProtectedRoute[] {
  return routes.filter((route) => {
    // Check route-level permissions
    if (
      route.permissions &&
      !hasPermission(route.permissions, userPermissions)
    ) {
      return false;
    }

    // Check navigation-level permissions
    if (
      route.navigation?.permissions &&
      !hasPermission(route.navigation.permissions, userPermissions)
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Get navigation items for sidebar (filtered by permissions)
 *
 * @param config - The route configuration
 * @param userPermissions - User permissions
 * @param resolver - Optional translation resolver for i18n support
 */
export function getNavigationItems(
  config: RouteConfig,
  userPermissions: UserPermissions,
  resolver?: RouteTranslationResolver
) {
  // Resolve translations if resolver provided
  const resolvedConfig = resolver
    ? getTranslatedRouteConfig(config, resolver)
    : config;

  // Filter protected routes by permissions
  const accessibleRoutes = filterRoutesByPermissions(
    resolvedConfig.protected,
    userPermissions
  );

  // Group routes by navigation group
  return resolvedConfig.navigationGroups
    .sort((a, b) => a.order - b.order)
    .map((group) => {
      const items = accessibleRoutes
        .filter((route) => route.navigation?.group === group.id)
        .sort(
          (a, b) => (a.navigation?.order ?? 0) - (b.navigation?.order ?? 0)
        );

      return {
        ...group,
        items,
      };
    })
    .filter((group) => group.items.length > 0);
}

/**
 * Get footer actions (filtered by permissions if needed)
 *
 * @param config - The route configuration
 * @param _userPermissions - User permissions (currently unused)
 * @param resolver - Optional translation resolver for i18n support
 */
export function getFooterActions(
  config: RouteConfig,
  _userPermissions?: UserPermissions,
  resolver?: RouteTranslationResolver
): RouteConfig["footerActions"] {
  // Resolve translations if resolver provided
  const resolvedConfig = resolver
    ? getTranslatedRouteConfig(config, resolver)
    : config;

  // Footer actions don't typically need permission filtering
  // but you can add it here if needed
  return resolvedConfig.footerActions;
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(
  route: ProtectedRoute,
  userPermissions: UserPermissions
): boolean {
  // Check route-level permissions
  if (route.permissions && !hasPermission(route.permissions, userPermissions)) {
    return false;
  }

  // Check navigation-level permissions
  if (
    route.navigation?.permissions &&
    !hasPermission(route.navigation.permissions, userPermissions)
  ) {
    return false;
  }

  return true;
}

/**
 * Middleware helper to check route access
 */
export function checkRouteAccess(
  pathname: string,
  userPermissions: UserPermissions,
  config: RouteConfig
): boolean {
  const route = config.protected.find((r) => r.path === pathname);

  if (!route) {
    // Public route or not found
    return true;
  }

  return canAccessRoute(route, userPermissions);
}
