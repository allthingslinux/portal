import Parser from "rss-parser";

const BLOG_FEED_URL = "https://allthingslinux.org/feed";

/** Revalidate feed every 5 minutes */
const FEED_REVALIDATE_SECONDS = 300;

export interface BlogPost {
  title: string;
  link: string;
  pubDate?: string;
  isoDate?: string;
  summary?: string;
}

const parser = new Parser({
  customFields: {
    item: [
      ["updated", "updated"],
      ["summary", "summary"],
      ["content", "content"],
    ],
  },
});

/**
 * Fetch the latest blog posts from the ATL blog feed.
 * Cached via Next.js fetch (revalidates every 5 minutes).
 */
export async function fetchLatestBlogPosts(limit = 4): Promise<BlogPost[]> {
  try {
    const response = await fetch(BLOG_FEED_URL, {
      next: { revalidate: FEED_REVALIDATE_SECONDS },
      headers: {
        "User-Agent": "Portal/1.0 (https://portal.atl.tools)",
      },
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    const feed = await parser.parseString(xml);

    return (feed.items ?? []).slice(0, limit).map((item) => {
      const rawLink = item.link ?? item.guid;
      let link = "#";
      if (typeof rawLink === "string") {
        link = rawLink;
      } else if (
        typeof rawLink === "object" &&
        rawLink !== null &&
        "href" in rawLink
      ) {
        link = String((rawLink as { href?: string }).href) || "#";
      }
      return {
        title: item.title ?? "Untitled",
        link: link || "#",
        pubDate: item.pubDate,
        isoDate: item.isoDate,
        summary:
          item.contentSnippet ?? item.content?.slice(0, 120) ?? undefined,
      };
    });
  } catch {
    return [];
  }
}
