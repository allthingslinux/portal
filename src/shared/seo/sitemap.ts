import type { MetadataRoute } from "next";

import { BASE_URL } from "@/config";
import type {
  ProtectedRoute,
  PublicRoute,
  RouteChild,
  RouteConfig,
} from "@/features/routing/lib/types";

function createSitemapEntry(
  path: string,
  sitemap?: { lastModified?: Date; changeFrequency?: string; priority?: number }
): MetadataRoute.Sitemap[0] {
  return {
    url: `${BASE_URL}${path}`,
    lastModified: sitemap?.lastModified || new Date(),
    changeFrequency: (sitemap?.changeFrequency ||
      "weekly") as MetadataRoute.Sitemap[0]["changeFrequency"],
    priority: sitemap?.priority || 0.5,
  };
}

function addPublicRoutes(
  routes: MetadataRoute.Sitemap,
  publicRoutes: PublicRoute[]
): void {
  for (const route of publicRoutes) {
    if (route.sitemap) {
      routes.push(createSitemapEntry(route.path, route.sitemap));
    }
  }
}

function addChildRoutes(
  routes: MetadataRoute.Sitemap,
  children: RouteChild[],
  parentMetadata: ProtectedRoute["metadata"]
): void {
  if (!children) {
    return;
  }

  for (const child of children) {
    const childMetadata = child.metadata || parentMetadata;
    if (childMetadata.robots?.index) {
      routes.push({
        url: `${BASE_URL}${child.path}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      });
    }
  }
}

function addProtectedRoutes(
  routes: MetadataRoute.Sitemap,
  protectedRoutes: ProtectedRoute[]
): void {
  for (const route of protectedRoutes) {
    if (route.metadata.robots?.index && route.sitemap) {
      routes.push(createSitemapEntry(route.path, route.sitemap));
    }

    if (route.navigation?.children) {
      addChildRoutes(routes, route.navigation.children, route.metadata);
    }
  }
}

/**
 * Generate sitemap from route configuration
 */
export function generateSitemap(config: RouteConfig): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  addPublicRoutes(routes, config.public);
  addProtectedRoutes(routes, config.protected);

  return routes;
}
