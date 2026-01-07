// Core configuration
/** biome-ignore-all lint/performance/noBarrelFile: Barrel file for navigation */

export type { BreadcrumbItem } from "./breadcrumbs";
export {
  generateBreadcrumbs,
  mergeBreadcrumbs,
} from "./breadcrumbs";
export { routeConfig } from "./config";
export {
  createPageMetadata,
  defaultMetadata,
  getRouteMetadata,
} from "./metadata";
export type { UserPermissions } from "./permissions";
export {
  canAccessRoute,
  checkRouteAccess,
  filterRoutesByPermissions,
  getFooterActions,
  getNavigationItems,
  hasPermission,
} from "./permissions";
export { generateRobots } from "./robots";
export { generateSitemap } from "./sitemap";
export type {
  BaseRoute,
  BreadcrumbConfig,
  FooterAction,
  NavigationConfig,
  NavigationGroup,
  Permission,
  ProtectedRoute,
  PublicRoute,
  RouteChild,
  RouteConfig,
  RouteMetadata,
  SitemapConfig,
  UIDisplay,
} from "./types";
export { getUIDisplay } from "./ui";
