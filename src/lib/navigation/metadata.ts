import type { Metadata } from "next";

import type { RouteConfig } from "./types";
import {
  APP_TITLE,
  APP_DESCRIPTION,
  APP_KEYWORDS,
  APP_AUTHOR,
  APP_CREATOR,
  APP_PUBLISHER,
  BASE_URL,
} from "@/lib/config";

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
 */
export function createPageMetadata(overrides: Metadata): Metadata {
  return {
    ...defaultMetadata,
    ...overrides,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...overrides.openGraph,
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...overrides.twitter,
    },
  };
}

/**
 * Get metadata for a route (for SEO, Open Graph, etc.)
 * Uses metadata field, not UI display
 */
export function getRouteMetadata(
  pathname: string,
  config: RouteConfig
): Metadata {
  const cleanPath = pathname.split("?")[0].split("#")[0];

  // Find route in config
  const allRoutes = [...config.public, ...config.protected];
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
