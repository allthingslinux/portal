import type { MetadataRoute } from "next";

// ============================================================================
// Robots.txt Generation
// ============================================================================
// Generates robots.txt for search engine crawler instructions
// See: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

export default function robots(): MetadataRoute.Robots {
  const baseURL =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://portal.allthingslinux.org");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/app/", // Authenticated dashboard routes
          "/api/", // API routes (not meant for crawling)
          "/auth/consent", // Auth consent page (not meant for indexing)
        ],
      },
      // Block specific bots if needed
      // {
      //   userAgent: "BadBot",
      //   disallow: "/",
      // },
    ],
    sitemap: `${baseURL}/sitemap.xml`,
  };
}
