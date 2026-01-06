import type { Metadata } from "next";

// ============================================================================
// Metadata Configuration
// ============================================================================
// Shared metadata configuration for the application
// Used across layout and pages for consistent SEO and Open Graph tags

// Get base URL for metadata
const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://portal.allthingslinux.org");

/**
 * Default metadata for the application
 * Can be extended or overridden in specific pages/layouts
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseURL),
  title: {
    default: "Portal - All Things Linux",
    template: "%s | Portal - All Things Linux",
  },
  description:
    "Centralized hub and identity management system for the All Things Linux (ATL) community. Manage access to email, IRC, XMPP, SSH pubnix spaces, web hosting, and more.",
  keywords: [
    "All Things Linux",
    "ATL",
    "Linux community",
    "identity management",
    "authentication",
    "portal",
  ],
  authors: [{ name: "All Things Linux" }],
  creator: "All Things Linux",
  publisher: "All Things Linux",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseURL,
    siteName: "Portal - All Things Linux",
    title: "Portal - All Things Linux",
    description:
      "Centralized hub and identity management system for the All Things Linux (ATL) community.",
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
    title: "Portal - All Things Linux",
    description:
      "Centralized hub and identity management system for the All Things Linux (ATL) community.",
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
