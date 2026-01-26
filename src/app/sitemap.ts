import type { MetadataRoute } from "next";

import { routeConfig } from "@/features/routing/lib";
import { generateSitemap } from "@/shared/seo";

// ============================================================================
// Sitemap Generation
// ============================================================================
// Generates sitemap.xml for search engine crawling from route configuration
// See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemap(routeConfig);
}
