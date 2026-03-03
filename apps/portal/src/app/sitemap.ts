import type { MetadataRoute } from "next";
import { generateSitemap } from "@portal/seo/sitemap";

import { routeConfig } from "@/features/routing/lib";

// ============================================================================
// Sitemap Generation
// ============================================================================
// Generates sitemap.xml for search engine crawling from route configuration
// See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemap(routeConfig);
}
