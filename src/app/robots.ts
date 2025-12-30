import type { MetadataRoute } from "next";

import appConfig from "~/lib/config/app.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${appConfig.url}/server-sitemap.xml`,
  };
}
