// ============================================================================
// Breadcrumb Configuration
// ============================================================================
// Centralized breadcrumb configuration for automatic breadcrumb generation.
// Maps route paths to their display labels.

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

// Route to label mapping for automatic breadcrumb generation
const routeLabels: Record<string, string> = {
  "/app": "Overview",
  "/app/admin": "Admin",
  "/app/settings": "Settings",
  "/app/analytics": "Analytics",
  "/app/reports": "Reports",
  "/app/projects": "Projects",
  "/docs": "Documentation",
};

// Default breadcrumb label generator from path segments
function generateLabelFromSegment(segment: string): string {
  // Convert route segment to readable label
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generate breadcrumbs from a pathname
 * Automatically creates breadcrumb trail from route segments
 */
export function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  // Remove query strings and hashes
  const cleanPath = pathname.split("?")[0].split("#")[0];

  // Split path into segments
  const segments = cleanPath.split("/").filter(Boolean);

  // Build breadcrumb trail
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with App if we're in the app section
  if (cleanPath.startsWith("/app")) {
    // If we're exactly at /app, show just one breadcrumb
    if (cleanPath === "/app") {
      breadcrumbs.push({
        label: routeLabels["/app"] || "Overview",
        href: undefined, // Current page, no link
      });
    } else {
      // For sub-routes, show App as first breadcrumb with link
      breadcrumbs.push({
        label: "App",
        href: "/app",
      });

      // Build path progressively
      let currentPath = "/app";
      for (let i = 1; i < segments.length; i++) {
        currentPath += `/${segments[i]}`;

        // Use configured label or generate from segment
        const label =
          routeLabels[currentPath] || generateLabelFromSegment(segments[i]);

        // Last segment is the current page (no href)
        const isLast = i === segments.length - 1;
        breadcrumbs.push({
          label,
          href: isLast ? undefined : currentPath,
        });
      }
    }
  } else if (cleanPath.startsWith("/docs")) {
    // Handle docs section
    breadcrumbs.push({
      label: routeLabels["/docs"] || "Documentation",
      href: "/docs",
    });

    if (segments.length > 1) {
      let currentPath = "/docs";
      for (let i = 1; i < segments.length; i++) {
        currentPath += `/${segments[i]}`;
        const label =
          routeLabels[currentPath] || generateLabelFromSegment(segments[i]);
        const isLast = i === segments.length - 1;
        breadcrumbs.push({
          label,
          href: isLast ? undefined : currentPath,
        });
      }
    }
  }

  // If no breadcrumbs were generated, return empty array
  // (for routes outside app/docs sections)
  return breadcrumbs;
}

/**
 * Merge custom breadcrumbs with auto-generated ones
 * Custom breadcrumbs take precedence and can override or extend the default
 */
export function mergeBreadcrumbs(
  autoBreadcrumbs: BreadcrumbItem[],
  customBreadcrumbs?: BreadcrumbItem[]
): BreadcrumbItem[] {
  if (!customBreadcrumbs || customBreadcrumbs.length === 0) {
    return autoBreadcrumbs;
  }

  // If custom breadcrumbs start with the same items as auto-generated,
  // merge intelligently
  if (
    autoBreadcrumbs.length > 0 &&
    customBreadcrumbs.length > 0 &&
    customBreadcrumbs[0].href === autoBreadcrumbs[0].href
  ) {
    // Keep auto-generated first item if it matches, then use custom for the rest
    return [autoBreadcrumbs[0], ...customBreadcrumbs.slice(1)];
  }

  // Otherwise, use custom breadcrumbs entirely
  return customBreadcrumbs;
}
