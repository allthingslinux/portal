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
  title?: string; // Optional - comes from translations
  description?: string; // Optional - comes from translations
  keywords?: string[];
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  openGraph?: Metadata["openGraph"];
  twitter?: Metadata["twitter"];
}

/**
 * UI display configuration (separate from SEO metadata)
 * Falls back to metadata if not provided
 */
export interface UIDisplay {
  title?: string; // UI title (shorter, user-friendly)
  description?: string; // UI description (shorter, user-friendly)
}

/**
 * Breadcrumb configuration
 */
export interface BreadcrumbConfig {
  label?: string; // Optional - comes from translations
  exact?: boolean; // If true, only matches exact path
}

/**
 * Navigation configuration
 */
export interface NavigationConfig {
  group: string;
  order: number;
  permissions?: Permission[];
  children?: RouteChild[];
  badge?: string | number;
}

/**
 * Route child configuration
 */
export interface RouteChild {
  id: string;
  path: string;
  label?: string; // Optional - comes from translations
  breadcrumb?: BreadcrumbConfig;
  metadata?: Partial<RouteMetadata>;
}

/**
 * Sitemap configuration
 */
export interface SitemapConfig {
  priority?: number; // 0.0 to 1.0
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  lastModified?: Date;
}

/**
 * Base route configuration
 */
export interface BaseRoute {
  id: string;
  path: string;
  label?: string; // Optional - comes from translations
  metadata: RouteMetadata; // title/description come from translations
  ui?: UIDisplay; // Optional UI display (falls back to metadata)
  breadcrumb?: BreadcrumbConfig;
  sitemap?: SitemapConfig;
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
  id: string;
  label?: string; // Optional - comes from translations
  icon: LucideIcon;
  path?: string;
  action?: "logout" | string; // Special actions
  variant?: "default" | "destructive";
  metadata?: Partial<RouteMetadata>;
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
  public: PublicRoute[];
  protected: ProtectedRoute[];
  navigationGroups: NavigationGroup[];
  footerActions: FooterAction[];
}

/**
 * Breadcrumb item for rendering
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}
