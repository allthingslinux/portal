import type { MetadataRoute } from "next";

// ============================================================================
// Sitemap Generation
// ============================================================================
// Generates sitemap.xml for search engine crawling
// See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

export default function sitemap(): MetadataRoute.Sitemap {
  const baseURL =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://portal.allthingslinux.org");

  // Public routes that should be indexed
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseURL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseURL}/auth/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseURL}/auth/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Add more public routes as needed
    // Note: /app/* routes are excluded as they require authentication
    // and have robots: { index: false } in their metadata
  ];

  return routes;
}
