import Parser from "rss-parser";

import type { FeedSource } from "@/config/feed";
import { FEED_ITEMS_PER_SOURCE, FEED_REVALIDATE_SECONDS } from "@/config/feed";

const BLOG_FEED_URL = "https://allthingslinux.org/feed";

/** Revalidate blog feed every 5 minutes */
const BLOG_FEED_REVALIDATE_SECONDS = 300;

export interface BlogPost {
  isoDate?: string;
  link: string;
  pubDate?: string;
  summary?: string;
  title: string;
}

export interface FeedArticle {
  /** Categories/tags extracted from the feed item */
  categories: string[];
  /** Unique key composed from sourceId + link */
  id: string;
  isoDate?: string;
  link: string;
  pubDate?: string;
  siteUrl: string;
  sourceId: string;
  sourceName: string;
  summary?: string;
  title: string;
}

export interface FeedSourceResult {
  articles: FeedArticle[];
  error?: string;
  sourceId: string;
  sourceName: string;
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

function resolveItemLink(item: { link?: string; guid?: string }): string {
  const rawLink = item.link ?? item.guid;
  if (typeof rawLink === "string") {
    return rawLink || "#";
  }
  if (typeof rawLink === "object" && rawLink !== null && "href" in rawLink) {
    return String((rawLink as { href?: string }).href) || "#";
  }
  return "#";
}

/** Strip emoji characters and variation selectors, then trim. */
function stripEmoji(str: string): string {
  return str
    .replace(/\p{Emoji_Presentation}/gu, "")
    .replace(/[\uFE0E\uFE0F]/g, "")
    .trim();
}

const PURE_NUMERIC_RE = /^\d+$/;

/**
 * Returns true if a string looks like a URL slug or advisory/package ID
 * rather than a human-readable tag (e.g. "debian-dsa-6154-1-php8-2",
 * "what-is-fail2ban", "python-azure-core-opensuse-2026-20292-1").
 * Rule: 3+ hyphen-separated segments, OR any segment is purely numeric.
 */
function isSlugLike(str: string): boolean {
  const segments = str.split("-");
  if (segments.length >= 3) {
    return true;
  }
  if (segments.some((s) => PURE_NUMERIC_RE.test(s))) {
    return true;
  }
  return false;
}

function normalizeCategories(item: Parser.Item): string[] {
  // rss-parser populates item.categories as string[] for both RSS and Atom feeds.
  const raw = item.categories;
  if (!raw?.length) {
    return [];
  }
  return raw
    .map((c) => {
      let str: string;
      if (typeof c === "string") {
        str = c;
      } else if (typeof c === "object" && c !== null) {
        // Defensive: handle unparsed Atom objects { _: "label", $: { term: "…" } }
        const obj = c as Record<string, unknown>;
        const term =
          (obj.$ as Record<string, unknown> | undefined)?.term ??
          obj._ ??
          obj.term;
        str = typeof term === "string" ? term : "";
      } else {
        str = "";
      }
      return stripEmoji(str).toLowerCase();
    })
    .filter((s) => s.length > 0 && s.length <= 50 && !isSlugLike(s));
}

/**
 * Returns the item's parsed categories, with two optional fallbacks when the
 * feed provides no <category> elements:
 *  1. categoryPattern — regex matched against the item description (first capture group used)
 *  2. categoryFromLinkPath — first path segment of the item link (e.g. "news", "review")
 */
function extractCategories(
  item: Parser.Item,
  link: string,
  pattern?: RegExp,
  fromLinkPath?: boolean
): string[] {
  const parsed = normalizeCategories(item);
  if (parsed.length > 0) {
    return parsed;
  }

  if (pattern) {
    const text = item.contentSnippet ?? item.content ?? "";
    const match = pattern.exec(text);
    if (match?.[1]) {
      const extracted = stripEmoji(match[1].trim()).toLowerCase();
      if (
        extracted.length > 0 &&
        extracted.length <= 50 &&
        !isSlugLike(extracted)
      ) {
        return [extracted];
      }
    }
  }

  if (fromLinkPath) {
    try {
      const segment = new URL(link).pathname.split("/").filter(Boolean)[0];
      if (segment && segment.length <= 50 && !isSlugLike(segment)) {
        return [segment.toLowerCase()];
      }
    } catch {
      // ignore malformed URLs
    }
  }

  return [];
}

/**
 * Fetch the latest blog posts from the ATL blog feed.
 * Cached via Next.js fetch (revalidates every 5 minutes).
 */
export async function fetchLatestBlogPosts(limit = 4): Promise<BlogPost[]> {
  try {
    const response = await fetch(BLOG_FEED_URL, {
      next: { revalidate: BLOG_FEED_REVALIDATE_SECONDS },
      headers: {
        "User-Agent": "Portal/1.0 (https://portal.atl.tools)",
      },
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    const feed = await parser.parseString(xml);

    return (feed.items ?? []).slice(0, limit).map((item) => ({
      title: item.title ?? "Untitled",
      link: resolveItemLink(item),
      pubDate: item.pubDate,
      isoDate: item.isoDate,
      summary: item.contentSnippet ?? item.content?.slice(0, 120) ?? undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch articles from a single RSS/Atom feed source.
 * Cached via Next.js ISR (revalidates per FEED_REVALIDATE_SECONDS).
 */
export async function fetchLinuxFeedSource(
  source: FeedSource
): Promise<FeedSourceResult> {
  try {
    const response = await fetch(source.feedUrl, {
      next: { revalidate: FEED_REVALIDATE_SECONDS },
      headers: {
        "User-Agent": "Portal/1.0 (https://portal.atl.tools)",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      return {
        sourceId: source.id,
        sourceName: source.name,
        articles: [],
        error: `HTTP ${response.status}`,
      };
    }

    const xml = await response.text();
    const feed = await parser.parseString(xml);

    const articles: FeedArticle[] = (feed.items ?? [])
      .sort((a, b) => {
        const dateA = new Date(a.isoDate ?? a.pubDate ?? 0).getTime();
        const dateB = new Date(b.isoDate ?? b.pubDate ?? 0).getTime();
        return dateB - dateA;
      })
      .slice(0, FEED_ITEMS_PER_SOURCE)
      .map((item, index) => {
        const link = resolveItemLink(item);
        const title = item.title ?? "Untitled";
        return {
          id: `${source.id}::${link}::${title}::${index}`,
          title,
          link,
          pubDate: item.pubDate,
          isoDate: item.isoDate,
          summary:
            (item.contentSnippet ?? item.content)?.slice(0, 200) ?? undefined,
          categories: extractCategories(
            item,
            link,
            source.categoryPattern,
            source.categoryFromLinkPath
          ),
          sourceId: source.id,
          sourceName: source.name,
          siteUrl: source.siteUrl,
        };
      });

    return { sourceId: source.id, sourceName: source.name, articles };
  } catch (err) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      articles: [],
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Fetch articles from all enabled feed sources in parallel.
 * Returns a flat, date-sorted list of articles alongside per-source results.
 */
export async function fetchAllLinuxFeeds(
  sources: FeedSource[]
): Promise<{ articles: FeedArticle[]; results: FeedSourceResult[] }> {
  const enabledSources = sources.filter((s) => s.enabled);
  const results = await Promise.all(
    enabledSources.map((s) => fetchLinuxFeedSource(s))
  );

  const articles = results
    .flatMap((r) => r.articles)
    .sort((a, b) => {
      const dateA = new Date(a.isoDate ?? a.pubDate ?? 0).getTime();
      const dateB = new Date(b.isoDate ?? b.pubDate ?? 0).getTime();
      return dateB - dateA;
    });

  return { articles, results };
}
