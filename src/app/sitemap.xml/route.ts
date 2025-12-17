import { getServerSideSitemap } from "next-sitemap";
import appConfig from "~/config/app.config";
import { createCmsClient } from "~/features/cms/core";

/**
 * @description The maximum age of the sitemap in seconds.
 * This is used to set the cache-control header for the sitemap. The cache-control header is used to control how long the sitemap is cached.
 * By default, the cache-control header is set to 'public, max-age=600, s-maxage=3600'.
 * This means that the sitemap will be cached for 600 seconds (10 minutes) and will be considered stale after 3600 seconds (1 hour).
 */
const MAX_AGE = 60;
const S_MAX_AGE = 3600;

export async function GET() {
  const paths = getPaths();
  const contentItems = await getContentItems();

  const headers = {
    "Cache-Control": `public, max-age=${MAX_AGE}, s-maxage=${S_MAX_AGE}`,
  };

  return getServerSideSitemap([...paths, ...contentItems], headers);
}

function getPaths() {
  const paths = [
    "/",
    "/faq",
    "/blog",
    "/docs",
    "/pricing",
    "/contact",
    "/cookie-policy",
    "/terms-of-service",
    "/privacy-policy",
    // add more paths here
  ];

  return paths.map((path) => ({
    loc: new URL(path, appConfig.url).href,
    lastmod: new Date().toISOString(),
  }));
}

async function getContentItems() {
  const client = await createCmsClient();

  // do not paginate the content items
  const limit = Number.POSITIVE_INFINITY;
  const posts = client
    .getContentItems({
      collection: "posts",
      content: false,
      limit,
    })
    .then((response) => response.items)
    .then((blogPosts) =>
      blogPosts.map((post) => ({
        loc: new URL(`/blog/${post.slug}`, appConfig.url).href,
        lastmod: post.publishedAt
          ? new Date(post.publishedAt).toISOString()
          : new Date().toISOString(),
      }))
    );

  const docs = client
    .getContentItems({
      collection: "documentation",
      content: false,
      limit,
    })
    .then((response) => response.items)
    .then((docItems) =>
      docItems.map((doc) => ({
        loc: new URL(`/docs/${doc.slug}`, appConfig.url).href,
        lastmod: doc.publishedAt
          ? new Date(doc.publishedAt).toISOString()
          : new Date().toISOString(),
      }))
    );

  return Promise.all([posts, docs]).then((items) => items.flat());
}
