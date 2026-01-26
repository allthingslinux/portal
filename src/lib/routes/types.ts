/**
 * Re-export route types from centralized types directory
 * This file maintains backward compatibility for existing imports
 */

export type {
  RouteMetadata,
  UIDisplay,
  BreadcrumbConfig,
  NavigationConfig,
  RouteChild,
  SitemapConfig,
  BaseRoute,
  ProtectedRoute,
  PublicRoute,
  FooterAction,
  NavigationGroup,
  RouteConfig,
  BreadcrumbItem,
} from "@/types/routes";

// Re-export Permission from auth types for convenience
export type { Permission } from "@/types/auth";
