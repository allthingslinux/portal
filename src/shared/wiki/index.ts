import { env } from "@/env";
import { mediawiki } from "@/features/integrations/lib/mediawiki";

const RECENT_CHANGES_LIMIT = 5;
const API_PATH_REGEX = /\/w\/api\.php$/;
const ROOT_API_REGEX = /\/api\.php$/;

export interface WikiChange {
  title: string;
  user: string;
  timestamp: string;
  pageId: number;
  url: string;
  /** bytes added (positive) or removed (negative) */
  diff: number;
}

/** Derive wiki base URL from API URL (e.g. https://atl.wiki/w/api.php -> https://atl.wiki) */
function getWikiBaseUrl(): string {
  const api = env.WIKI_API_URL;
  return api.replace(API_PATH_REGEX, "").replace(ROOT_API_REGEX, "") || api;
}

/** Build wiki page URL from title (atl.wiki uses article path /$1) */
function pageUrl(title: string): string {
  const base = getWikiBaseUrl();
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));
  return `${base}/${encoded}`;
}

/**
 * Fetch recent wiki changes for dashboard display.
 */
export async function fetchRecentWikiChanges(): Promise<WikiChange[]> {
  try {
    const changes = await mediawiki.getRecentChanges({
      limit: RECENT_CHANGES_LIMIT,
      rctype: "edit",
    });

    return changes.map((c) => ({
      title: c.title,
      user: c.user,
      timestamp: c.timestamp,
      pageId: c.pageId,
      url: pageUrl(c.title),
      diff: c.diff,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch wiki site statistics.
 */
export async function fetchWikiStats() {
  try {
    return await mediawiki.getSiteStats();
  } catch {
    return null;
  }
}
