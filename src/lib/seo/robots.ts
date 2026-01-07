import type { MetadataRoute } from "next";

import { BASE_URL } from "@/lib/config";
import type { RouteConfig } from "@/lib/routes/types";

/**
 * Generate robots.txt from route configuration
 * Automatically disallows protected routes and API routes
 */
export function generateRobots(config: RouteConfig): MetadataRoute.Robots {
  // Collect disallowed paths from route config
  const disallowedPaths: string[] = [];

  // Add all protected routes (they require authentication)
  for (const route of config.protected) {
    if (route.metadata.robots?.index === false) {
      disallowedPaths.push(`${route.path}/`);
    }
  }

  // Always disallow API routes
  disallowedPaths.push("/api/");

  // Always disallow auth consent page
  disallowedPaths.push("/auth/consent");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowedPaths,
      },
      // Block specific bots if needed
      // {
      //   userAgent: "BadBot",
      //   disallow: "/",
      // },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
