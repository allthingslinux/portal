import type { RouteTranslationResolver } from "./i18n";
import { getTranslatedRouteConfig } from "./i18n";
import type { ProtectedRoute, PublicRoute, RouteConfig } from "./types";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Find route by path in config
 */
function findRouteByPath(
  config: RouteConfig,
  path: string
):
  | ((ProtectedRoute | PublicRoute) & {
      child?: { label?: string; breadcrumb?: { label?: string } };
    })
  | undefined {
  const allRoutes = [...config.public, ...config.protected];

  // Try exact match first
  const route = allRoutes.find((r) => r.path === path);

  if (route) {
    return route;
  }

  // Try matching with children
  for (const r of config.protected) {
    if (r.navigation?.children) {
      const child = r.navigation.children.find((c) => c.path === path);
      if (child) {
        // Return parent route with child info
        return {
          ...r,
          child: {
            label: child.label,
            breadcrumb: child.breadcrumb,
          },
        };
      }
    }
  }

  return undefined;
}

/**
 * Generate breadcrumbs from pathname using route config
 * @param pathname - The pathname to generate breadcrumbs for
 * @param config - The route configuration
 * @param resolver - Optional translation resolver for i18n support
 */
export function generateBreadcrumbs(
  pathname: string,
  config: RouteConfig,
  resolver?: RouteTranslationResolver
): BreadcrumbItem[] {
  const cleanPath = pathname.split("?")[0].split("#")[0];
  const segments = cleanPath.split("/").filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [];

  // Resolve translations if resolver provided
  const resolvedConfig = resolver
    ? getTranslatedRouteConfig(config, resolver)
    : config;

  // Find the route
  const route = findRouteByPath(resolvedConfig, cleanPath);

  if (!route) {
    // Fallback: generate from path segments
    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      breadcrumbs.push({
        label:
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        href: isLast ? undefined : currentPath,
      });
    });
    return breadcrumbs;
  }

  // Build breadcrumbs from route config
  if (cleanPath.startsWith("/app")) {
    // Add "App" as first breadcrumb for app routes
    breadcrumbs.push({
      label: "App",
      href: "/app",
    });
  }

  // Add route breadcrumb
  if (route.breadcrumb?.label) {
    breadcrumbs.push({
      label: route.breadcrumb.label,
      href: route.breadcrumb.exact ? undefined : route.path,
    });
  } else if (route.label) {
    breadcrumbs.push({
      label: route.label,
      href: undefined, // Current page
    });
  }

  // Add child breadcrumb if exists
  if ("child" in route && route.child) {
    const childLabel = route.child.breadcrumb?.label || route.child.label;
    if (childLabel) {
      breadcrumbs.push({
        label: childLabel,
        href: undefined,
      });
    }
  }

  return breadcrumbs;
}

/**
 * Merge custom breadcrumbs with auto-generated ones
 */
export function mergeBreadcrumbs(
  auto: BreadcrumbItem[],
  custom?: BreadcrumbItem[]
): BreadcrumbItem[] {
  if (!custom || custom.length === 0) {
    return auto;
  }

  // If custom starts with same item, merge intelligently
  if (auto.length > 0 && custom.length > 0 && auto[0].href === custom[0].href) {
    return [auto[0], ...custom.slice(1)];
  }

  return custom;
}
