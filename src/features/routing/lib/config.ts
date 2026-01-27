import {
  BookOpen,
  Bot,
  HelpCircle,
  LogOut,
  MessageSquare,
  Settings2,
  Shield,
  SquareTerminal,
} from "lucide-react";

import type { ProtectedRoute, RouteConfig } from "./types";
import type { IntegrationPublicInfo } from "@/features/integrations/lib/core/types";

/**
 * Single source of truth for all application routes
 * Used for: navigation, breadcrumbs, metadata, sitemap, permissions
 *
 * Note: Display strings (label, title, description) are stored in locale files.
 * This config only contains structure (paths, icons, permissions, etc.)
 */
export const routeConfig = {
  // Public routes (no auth required)
  public: [
    {
      id: "home",
      path: "/",
      metadata: {
        robots: { index: true, follow: true },
      },
      sitemap: {
        priority: 1,
        changeFrequency: "weekly",
      },
    },
    {
      id: "sign-in",
      path: "/auth/sign-in",
      metadata: {
        robots: { index: false, follow: false },
      },
      sitemap: {
        priority: 0.8,
        changeFrequency: "monthly",
      },
    },
    {
      id: "sign-up",
      path: "/auth/sign-up",
      metadata: {
        robots: { index: false, follow: false },
      },
      sitemap: {
        priority: 0.8,
        changeFrequency: "monthly",
      },
    },
  ],

  // Protected routes (require authentication)
  protected: [
    {
      id: "dashboard",
      path: "/app",
      icon: SquareTerminal,
      metadata: {
        robots: { index: false, follow: false },
      },
      breadcrumb: {
        exact: true,
      },
      navigation: {
        group: "platform",
        order: 1,
      },
    },
    {
      id: "projects",
      path: "/app/projects",
      icon: Bot,
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 2,
        children: [
          {
            id: "projects-all",
            path: "/app/projects",
            breadcrumb: {},
          },
          {
            id: "projects-active",
            path: "/app/projects/active",
            breadcrumb: {},
          },
          {
            id: "projects-archived",
            path: "/app/projects/archived",
            breadcrumb: {},
          },
        ],
      },
    },
    {
      id: "documentation",
      path: "/docs",
      icon: BookOpen,
      metadata: {
        robots: { index: true, follow: true },
      },
      navigation: {
        group: "platform",
        order: 3,
        children: [
          {
            id: "docs-intro",
            path: "/docs",
            breadcrumb: {},
          },
          {
            id: "docs-getting-started",
            path: "/docs/getting-started",
            breadcrumb: {},
          },
          {
            id: "docs-api",
            path: "/docs/api",
            breadcrumb: {},
          },
        ],
      },
      sitemap: {
        priority: 0.6,
        changeFrequency: "monthly",
      },
    },
    {
      id: "settings",
      path: "/app/settings",
      icon: Settings2,
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 4,
      },
    },
    {
      id: "integrations",
      path: "/app/integrations",
      icon: MessageSquare,
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 5,
      },
    },
    {
      id: "admin",
      path: "/app/admin",
      icon: Shield,
      metadata: {
        robots: { index: false, follow: false },
      },
      navigation: {
        group: "platform",
        order: 6,
        permissions: ["canViewAdmin"], // Role-based access
      },
    },
  ],

  // Navigation groups configuration
  navigationGroups: [
    {
      id: "platform",
      order: 1,
    },
  ],

  // Footer actions (user actions in sidebar)
  footerActions: [
    {
      id: "support",
      icon: HelpCircle,
      path: "/support",
      metadata: {
        robots: { index: true, follow: true },
      },
    },
    {
      id: "logout",
      icon: LogOut,
      action: "logout", // Special action, not a route
      variant: "destructive",
    },
  ],
} as RouteConfig;

interface IntegrationRouteOptions {
  basePath?: string;
  pathOverrides?: Record<string, string>;
}

/**
 * Build integration routes for dynamic navigation.
 */
export function buildIntegrationRoutes(
  integrations: IntegrationPublicInfo[],
  options: IntegrationRouteOptions = {}
): ProtectedRoute[] {
  const basePath = options.basePath ?? "/app/integrations";
  const pathOverrides = options.pathOverrides ?? {};

  return integrations.map((integration) => ({
    id: `integration-${integration.id}`,
    path: pathOverrides[integration.id] ?? `${basePath}/${integration.id}`,
    icon: MessageSquare,
    metadata: {
      robots: { index: false, follow: false },
    },
    navigation: {
      group: "platform",
      order: 99,
    },
  }));
}

/**
 * Merge integration routes into the base route configuration.
 */
export function getRouteConfigWithIntegrations(
  integrations: IntegrationPublicInfo[],
  options?: IntegrationRouteOptions
): RouteConfig {
  return {
    ...routeConfig,
    protected: [
      ...routeConfig.protected,
      ...buildIntegrationRoutes(integrations, options),
    ],
  };
}
