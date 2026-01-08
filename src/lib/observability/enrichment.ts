/**
 * Event data enrichment utilities for Portal
 * Adds structured and unstructured data to Sentry events
 */

interface PortalUserContext {
  id?: string;
  email?: string;
  username?: string;
  role?: string;
  subscription?: string;
  tenant?: string;
}

interface PortalEventContext {
  feature?: string;
  component?: string;
  action?: string;
  route?: string;
  userAgent?: string;
  viewport?: string;
}

/**
 * Set user context with Portal-specific data
 */
export const setPortalUser = (user: PortalUserContext): void => {
  try {
    const { setUser, setTag } = require("@sentry/nextjs");

    // Set user context (structured, searchable)
    setUser({
      id: user.id,
      email: user.email, // Will be filtered out by beforeSend
      username: user.username,
    });

    // Set user-related tags for filtering and alerts
    if (user.role) {
      setTag("user.role", user.role);
    }
    if (user.subscription) {
      setTag("user.subscription", user.subscription);
    }
    if (user.tenant) {
      setTag("user.tenant", user.tenant);
    }
  } catch {
    // Sentry not available
  }
};

/**
 * Set Portal-specific tags for business context
 */
export const setPortalTags = (tags: Record<string, string>): void => {
  try {
    const { setTag } = require("@sentry/nextjs");

    for (const [key, value] of Object.entries(tags)) {
      setTag(`portal.${key}`, value);
    }
  } catch {
    // Sentry not available
  }
};

/**
 * Set feature-specific context
 */
export const setFeatureContext = (context: PortalEventContext): void => {
  try {
    const { setContext, setTag } = require("@sentry/nextjs");

    // Set as context for debugging
    setContext("portal_feature", {
      feature: context.feature,
      component: context.component,
      action: context.action,
      route: context.route,
      timestamp: new Date().toISOString(),
    });

    // Set key items as tags for filtering
    if (context.feature) {
      setTag("portal.feature", context.feature);
    }
    if (context.component) {
      setTag("portal.component", context.component);
    }
  } catch {
    // Sentry not available
  }
};

/**
 * Set browser/device context
 */
export const setBrowserContext = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const { setContext } = require("@sentry/nextjs");

    setContext("browser_info", {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${window.screen.width}x${window.screen.height}`,
      pixelRatio: window.devicePixelRatio,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
      platform: navigator.platform,
    });
  } catch {
    // Sentry not available
  }
};

/**
 * Add breadcrumb for user actions
 */
export const addActionBreadcrumb = (
  action: string,
  category = "user",
  data?: Record<string, unknown>
): void => {
  try {
    const { addBreadcrumb } = require("@sentry/nextjs");

    addBreadcrumb({
      message: action,
      category: `portal.${category}`,
      level: "info",
      data: {
        timestamp: new Date().toISOString(),
        ...data,
      },
    });
  } catch {
    // Sentry not available
  }
};

/**
 * Set deployment context
 */
export const setDeploymentContext = (): void => {
  try {
    const { setContext, setTag } = require("@sentry/nextjs");

    // Set deployment info as context
    setContext("deployment", {
      buildId: process.env.BUILD_ID,
      gitHash: process.env.GIT_HASH,
      deployTime: process.env.DEPLOY_TIME,
      region: process.env.VERCEL_REGION || process.env.AWS_REGION,
    });

    // Set region as tag for filtering
    const region = process.env.VERCEL_REGION || process.env.AWS_REGION;
    if (region) {
      setTag("deployment.region", region);
    }
  } catch {
    // Sentry not available
  }
};

/**
 * Comprehensive Portal context setup
 */
export const initializePortalContext = (user?: PortalUserContext): void => {
  // Set user context if provided
  if (user) {
    setPortalUser(user);
  }

  // Set browser context (client-side only)
  setBrowserContext();

  // Set deployment context
  setDeploymentContext();

  // Set initial Portal tags
  setPortalTags({
    service: "portal",
    domain: typeof window !== "undefined" ? window.location.hostname : "server",
  });
};
