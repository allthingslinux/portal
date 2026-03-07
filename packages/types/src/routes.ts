/**
 * Route configuration and navigation types
 */

import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";

import type { Permission } from "./auth";

/**
 * Route metadata for SEO
 */
export interface RouteMetadata {
  description?: string; // Optional - comes from translations
  keywords?: string[];
  openGraph?: Metadata["openGraph"];
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  title?: string; // Optional - comes from translations
  twitter?: Metadata["twitter"];
}

/**
 * UI display configuration (separate from SEO metadata)
 * Falls back to metadata if not provided
 */
export interface UIDisplay {
  description?: string; // UI description (shorter, user-friendly)
  title?: string; // UI title (shorter, user-friendly)
}

/**
 * Breadcrumb configuration
 */
export interface BreadcrumbConfig {
  exact?: boolean; // If true, only matches exact path
  label?: string; // Optional - comes from translations
}

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  badge?: string | number;
  children?: RouteChild[];
  group: string;
  order: number;
  permissions?: Permission[];
}

/**
 * Route child configuration
 */
export interface RouteChild {
  breadcrumb?: BreadcrumbConfig;
  id: string;
  label?: string; // Optional - comes from translations
  metadata?: Partial<RouteMetadata>;
  path: string;
}

/**
 * Sitemap configuration
 */
export interface SitemapConfig {
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  lastModified?: Date;
  priority?: number; // 0.0 to 1.0
}

/**
 * Base route configuration
 */
export interface BaseRoute {
  breadcrumb?: BreadcrumbConfig;
  id: string;
  label?: string; // Optional - comes from translations
  metadata: RouteMetadata; // title/description come from translations
  path: string;
  sitemap?: SitemapConfig;
  ui?: UIDisplay; // Optional UI display (falls back to metadata)
}

/**
 * Protected route configuration (requires authentication)
 */
export interface ProtectedRoute extends BaseRoute {
  icon?: LucideIcon;
  navigation?: NavigationConfig;
  permissions?: Permission[]; // Route-level permissions (for page access)
}

/**
 * Public route configuration
 */
export interface PublicRoute extends BaseRoute {
  sitemap: SitemapConfig;
}

/**
 * Footer action configuration
 */
export interface FooterAction {
  action?: "logout" | string; // Special actions
  icon: LucideIcon;
  id: string;
  label?: string; // Optional - comes from translations
  metadata?: Partial<RouteMetadata>;
  path?: string;
  variant?: "default" | "destructive";
}

/**
 * Navigation group configuration
 */
export interface NavigationGroup {
  id: string;
  label?: string; // Optional - comes from translations
  order: number;
}

/**
 * Complete route configuration
 */
export interface RouteConfig {
  footerActions: FooterAction[];
  navigationGroups: NavigationGroup[];
  protected: ProtectedRoute[];
  public: PublicRoute[];
}

/**
 * Breadcrumb item for rendering
 */
export interface BreadcrumbItem {
  href?: string;
  label: string;
}
