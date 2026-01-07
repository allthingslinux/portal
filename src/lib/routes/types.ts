import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";

export type Permission =
  | "canViewAdmin"
  | "canViewStaff"
  | "canViewAnalytics"
  | string;

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

export interface BreadcrumbConfig {
  label?: string; // Optional - comes from translations
  exact?: boolean; // If true, only matches exact path
}

export interface NavigationConfig {
  group: string;
  order: number;
  permissions?: Permission[];
  children?: RouteChild[];
  badge?: string | number;
}

export interface RouteChild {
  id: string;
  path: string;
  label?: string; // Optional - comes from translations
  breadcrumb?: BreadcrumbConfig;
  metadata?: Partial<RouteMetadata>;
}

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

export interface BaseRoute {
  id: string;
  path: string;
  label?: string; // Optional - comes from translations
  metadata: RouteMetadata; // title/description come from translations
  ui?: UIDisplay; // Optional UI display (falls back to metadata)
  breadcrumb?: BreadcrumbConfig;
  sitemap?: SitemapConfig;
}

export interface ProtectedRoute extends BaseRoute {
  icon?: LucideIcon;
  navigation?: NavigationConfig;
  permissions?: Permission[]; // Route-level permissions (for page access)
}

export interface PublicRoute extends BaseRoute {
  sitemap: SitemapConfig;
}

export interface FooterAction {
  id: string;
  label?: string; // Optional - comes from translations
  icon: LucideIcon;
  path?: string;
  action?: "logout" | string; // Special actions
  variant?: "default" | "destructive";
  metadata?: Partial<RouteMetadata>;
}

export interface NavigationGroup {
  id: string;
  label?: string; // Optional - comes from translations
  order: number;
}

export interface RouteConfig {
  public: PublicRoute[];
  protected: ProtectedRoute[];
  navigationGroups: NavigationGroup[];
  footerActions: FooterAction[];
}
