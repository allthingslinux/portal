import type { Permission, ProtectedRoute, RouteConfig } from "./types";

/**
 * User permissions interface
 * Extend this based on your permission system
 */
export interface UserPermissions {
  canViewAdmin?: boolean;
  canViewStaff?: boolean;
  canViewAnalytics?: boolean;
  [key: string]: boolean | undefined;
}

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
 */
export function getNavigationItems(
  config: RouteConfig,
  userPermissions: UserPermissions
) {
  // Filter protected routes by permissions
  const accessibleRoutes = filterRoutesByPermissions(
    config.protected,
    userPermissions
  );

  // Group routes by navigation group
  const grouped = config.navigationGroups
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
    .filter((group) => group.items.length > 0); // Remove empty groups

  return grouped;
}

/**
 * Get footer actions (filtered by permissions if needed)
 */
export function getFooterActions(
  config: RouteConfig,
  _userPermissions?: UserPermissions
): RouteConfig["footerActions"] {
  // Footer actions don't typically need permission filtering
  // but you can add it here if needed
  return config.footerActions;
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
