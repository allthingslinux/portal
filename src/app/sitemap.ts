import type { MetadataRoute } from "next";

import { routeConfig } from "@/lib/routes";
import { generateSitemap } from "@/lib/seo";

// ============================================================================
// Sitemap Generation
// ============================================================================
// Generates sitemap.xml for search engine crawling from route configuration
// See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemap(routeConfig);
}
