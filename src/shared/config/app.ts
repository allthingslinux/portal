// ============================================================================
// Application Configuration
// ============================================================================
// Centralized configuration for application-wide constants
// Use this file for app name, URLs, organization info, and other static values

/**
 * Application name
 */
export const APP_NAME = "Portal";

/**
 * Organization name
 */
export const ORG_NAME = "All Things Linux";

/**
 * Organization abbreviation
 */
export const ORG_ABBR = "ATL";

/**
 * Full application title (for SEO, metadata, etc.)
 */
export const APP_TITLE = `${APP_NAME} - ${ORG_NAME}`;

/**
 * Base URL for the application
 * Falls back to localhost in development, production URL otherwise
 */
export function getBaseURL(): string {
  return (
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://portal.atl.tools")
  );
}

/**
 * Base URL as a constant (computed once)
 */
export const BASE_URL = getBaseURL();

/**
 * Application description
 */
export const APP_DESCRIPTION =
  "Centralized hub and identity management system for the All Things Linux (ATL) community. Manage access to email, IRC, XMPP, SSH pubnix spaces, web hosting, and more.";

/**
 * Application keywords for SEO
 */
export const APP_KEYWORDS = [
  "All Things Linux",
  "ATL",
  "Linux community",
  "identity management",
  "authentication",
  "portal",
];

/**
 * Application author information
 */
export const APP_AUTHOR = {
  name: ORG_NAME,
};

/**
 * Application creator/publisher
 */
export const APP_CREATOR = ORG_NAME;
export const APP_PUBLISHER = ORG_NAME;
