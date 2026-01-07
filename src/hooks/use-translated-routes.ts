"use client";

import { useTranslations } from "next-intl";

import {
  createRouteTranslationResolver,
  getTranslatedRouteConfig,
  routeConfig,
} from "@/lib/routes";
import type { RouteConfig } from "@/lib/routes/types";

/**
 * Hook to get translated route configuration
 * Automatically resolves translations based on route IDs
 *
 * Translations are looked up in the format: routes.{routeId}.{field}
 * e.g., routes.home.label, routes.dashboard.metadata.title
 *
 * Uses dot notation with a single useTranslations() call (no namespace parameter)
 * to ensure i18n-ally can properly detect translation keys.
 *
 * @example
 * ```tsx
 * const translatedConfig = useTranslatedRoutes();
 * const navigationItems = getNavigationItems(translatedConfig, permissions);
 * ```
 */
export function useTranslatedRoutes(): RouteConfig {
  const t = useTranslations();
  const resolver = createRouteTranslationResolver(t);
  return getTranslatedRouteConfig(routeConfig, resolver);
}
