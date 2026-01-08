import type { Metadata } from "next";
import merge from "lodash/merge";

import {
  APP_AUTHOR,
  APP_CREATOR,
  APP_DESCRIPTION,
  APP_KEYWORDS,
  APP_PUBLISHER,
  APP_TITLE,
  BASE_URL,
} from "@/lib/config";
import type { RouteTranslationResolver } from "@/lib/routes/i18n";
import { getTranslatedRouteConfig } from "@/lib/routes/i18n";
import type { RouteConfig } from "@/lib/routes/types";

// ============================================================================
// Default Metadata Configuration
// ============================================================================
// Base metadata used across the application
// Can be extended or overridden in specific pages/layouts

/**
 * Default metadata for the application
 * Used as fallback and base for all pages
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: APP_TITLE,
    template: `%s | ${APP_TITLE}`,
  },
  description: APP_DESCRIPTION,
  keywords: APP_KEYWORDS,
  authors: [APP_AUTHOR],
  creator: APP_CREATOR,
  publisher: APP_PUBLISHER,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    // Locale is set to 'en_US' for English (default locale)
    // For locale-aware metadata, use generateMetadata in individual pages
    // and call getLocale() from 'next-intl/server' to get the current locale
    locale: "en_US",
    url: BASE_URL,
    siteName: APP_TITLE,
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    // TODO: Add Open Graph image when available
    // images: [
    //   {
    //     url: "/og-image.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "Portal - All Things Linux",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    // TODO: Add Twitter image when available
    // images: ["/twitter-image.png"],
    // creator: "@allthingslinux",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

/**
 * Helper function to create page-specific metadata
 * Merges overrides with default metadata, preserving nested objects
 * Uses lodash.merge for deep merging of nested properties
 */
export function createPageMetadata(overrides: Metadata): Metadata {
  return merge({}, defaultMetadata, overrides);
}

/**
 * Get metadata for a route (for SEO, Open Graph, etc.)
 * Uses metadata field, not UI display
 *
 * @param pathname - The pathname to look up
 * @param config - The route configuration
 * @param resolver - Optional translation resolver for i18n support
 */
export function getRouteMetadata(
  pathname: string,
  config: RouteConfig,
  resolver?: RouteTranslationResolver
): Metadata {
  const cleanPath = pathname.split("?")[0].split("#")[0];

  // Resolve translations if resolver provided
  const resolvedConfig = resolver
    ? getTranslatedRouteConfig(config, resolver)
    : config;

  // Find route in config
  const allRoutes = [...resolvedConfig.public, ...resolvedConfig.protected];
  const route = allRoutes.find((r) => r.path === cleanPath);

  if (!route) {
    // Fallback to default metadata
    return defaultMetadata;
  }

  // Build metadata from route config (always uses metadata, not UI)
  return createPageMetadata({
    title: route.metadata.title,
    description: route.metadata.description,
    keywords: route.metadata.keywords,
    robots: route.metadata.robots,
    openGraph: route.metadata.openGraph,
    twitter: route.metadata.twitter,
  });
}
