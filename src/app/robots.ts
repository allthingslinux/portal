import type { MetadataRoute } from "next";

import { routeConfig } from "@/lib/routes";
import { generateRobots } from "@/lib/seo";

// ============================================================================
// Robots.txt Generation
// ============================================================================
// Generates robots.txt for search engine crawler instructions from route configuration
// See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

export default function robots(): MetadataRoute.Robots {
  return generateRobots(routeConfig);
}
