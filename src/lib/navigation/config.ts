import {
  BookOpen,
  Bot,
  HelpCircle,
  LogOut,
  Settings2,
  Shield,
  SquareTerminal,
} from "lucide-react";

import { APP_TITLE } from "@/lib/config";
import type { RouteConfig } from "./types";

/**
 * Single source of truth for all application routes
 * Used for: navigation, breadcrumbs, metadata, sitemap, permissions
 */
export const routeConfig: RouteConfig = {
  // Public routes (no auth required)
  public: [
    {
      id: "home",
      path: "/",
      label: "Home",
      metadata: {
        title: "Home",
        description: `Welcome to ${APP_TITLE}`,
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
      label: "Sign In",
      metadata: {
        title: "Sign In",
        description: "Sign in to your account",
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
      label: "Sign Up",
      metadata: {
        title: "Sign Up",
        description: "Create a new account",
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
      label: "Dashboard",
      icon: SquareTerminal,
      metadata: {
        title: `Dashboard | ${APP_TITLE}`,
        description:
          "Your comprehensive dashboard overview for managing all your All Things Linux services and account settings.",
        robots: { index: false, follow: false },
      },
      ui: {
        title: "Dashboard",
        description: "Your dashboard overview",
      },
      breadcrumb: {
        label: "Overview",
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
      label: "Projects",
      icon: Bot,
      metadata: {
        title: `Projects | ${APP_TITLE}`,
        description: "Manage your projects",
        robots: { index: false, follow: false },
      },
      ui: {
        title: "Projects",
        description: "Manage your projects",
      },
      breadcrumb: {
        label: "Projects",
      },
      navigation: {
        group: "platform",
        order: 2,
        children: [
          {
            id: "projects-all",
            path: "/app/projects",
            label: "All Projects",
            breadcrumb: { label: "All Projects" },
          },
          {
            id: "projects-active",
            path: "/app/projects/active",
            label: "Active",
            breadcrumb: { label: "Active" },
          },
          {
            id: "projects-archived",
            path: "/app/projects/archived",
            label: "Archived",
            breadcrumb: { label: "Archived" },
          },
        ],
      },
    },
    {
      id: "documentation",
      path: "/docs",
      label: "Documentation",
      icon: BookOpen,
      metadata: {
        title: `Documentation | ${APP_TITLE}`,
        description: "Platform documentation",
        robots: { index: true, follow: true },
      },
      ui: {
        title: "Documentation",
        description: "Platform documentation",
      },
      breadcrumb: {
        label: "Documentation",
      },
      navigation: {
        group: "platform",
        order: 3,
        children: [
          {
            id: "docs-intro",
            path: "/docs",
            label: "Introduction",
            breadcrumb: { label: "Introduction" },
          },
          {
            id: "docs-getting-started",
            path: "/docs/getting-started",
            label: "Getting Started",
            breadcrumb: { label: "Getting Started" },
          },
          {
            id: "docs-api",
            path: "/docs/api",
            label: "API Reference",
            breadcrumb: { label: "API Reference" },
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
      label: "Settings",
      icon: Settings2,
      metadata: {
        title: `Settings | ${APP_TITLE}`,
        description: "Manage your account and security settings",
        robots: { index: false, follow: false },
      },
      ui: {
        title: "Settings",
        description: "Manage your account and security settings",
      },
      breadcrumb: {
        label: "Settings",
      },
      navigation: {
        group: "platform",
        order: 4,
      },
    },
    {
      id: "admin",
      path: "/app/admin",
      label: "Admin",
      icon: Shield,
      metadata: {
        title: `Admin Dashboard | ${APP_TITLE}`,
        description: "Administrative dashboard",
        robots: { index: false, follow: false },
      },
      ui: {
        title: "Admin",
        description: "Administrative dashboard",
      },
      breadcrumb: {
        label: "Admin",
      },
      navigation: {
        group: "platform",
        order: 5,
        permissions: ["canViewAdmin"], // Role-based access
      },
    },
  ],

  // Navigation groups configuration
  navigationGroups: [
    {
      id: "platform",
      label: "Platform",
      order: 1,
    },
  ],

  // Footer actions (user actions in sidebar)
  footerActions: [
    {
      id: "support",
      label: "Support",
      icon: HelpCircle,
      path: "/support",
      metadata: {
        title: "Support",
        description: "Get help and support",
        robots: { index: true, follow: true },
      },
    },
    {
      id: "logout",
      label: "Log out",
      icon: LogOut,
      action: "logout", // Special action, not a route
      variant: "destructive",
    },
  ],
};
