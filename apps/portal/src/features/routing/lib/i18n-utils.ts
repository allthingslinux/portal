import { getTranslations } from "next-intl/server";

import {
  createRouteTranslationResolver,
  type RouteTranslationResolver,
} from "./i18n";

/**
 * Get a server-side translation resolver for route configuration
 * Use this in Server Components, Server Actions, and generateMetadata
 *
 * @example
 * ```tsx
 * export async function generateMetadata() {
 *   const resolver = await getServerRouteResolver();
 *   return getRouteMetadata("/app", routeConfig, resolver);
 * }
 * ```
 */
export async function getServerRouteResolver(): Promise<RouteTranslationResolver> {
  const t = await getTranslations();
  return createRouteTranslationResolver(t);
}
