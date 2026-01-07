import type { MetadataRoute } from "next";
import { routeConfig } from "@/lib/navigation";
import { generateSitemap } from "@/lib/navigation/sitemap";

// ============================================================================
// Sitemap Generation
// ============================================================================
// Generates sitemap.xml for search engine crawling from route configuration
// See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemap(routeConfig);
}
