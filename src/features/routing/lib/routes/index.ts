// Core routing configuration
/** biome-ignore-all lint/performance/noBarrelFile: Barrel file for routes */

export type { BreadcrumbItem } from "./breadcrumbs";
export { generateBreadcrumbs, mergeBreadcrumbs } from "./breadcrumbs";
export { routeConfig } from "./config";
export {
  createRouteTranslationResolver,
  getTranslatedRouteConfig,
  type RouteTranslationResolver,
  type TranslationResolver,
} from "./i18n";
export { getServerRouteResolver } from "./i18n-utils";
export type { UserPermissions } from "./permissions";
export {
  canAccessRoute,
  checkRouteAccess,
  filterRoutesByPermissions,
  getFooterActions,
  getNavigationItems,
  hasPermission,
} from "./permissions";
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
