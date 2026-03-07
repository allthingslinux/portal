import { env } from "@/env";

/**
 * MediaWiki API client for read-only operations (recent changes, page info, etc.)
 * Uses native fetch — no login required for public wikis.
 */
class MediaWikiClient {
  private readonly userAgent =
    "Portal/1.0 (https://portal.atl.tools; contact@atl.dev)";

  private async request(
    params: Record<string, string | number | undefined>
  ): Promise<Record<string, unknown>> {
    const url = new URL(env.WIKI_API_URL);
    url.searchParams.set("format", "json");
    url.searchParams.set("formatversion", "2");
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": this.userAgent },
    });
    if (!res.ok) {
      throw new Error(`MediaWiki API error: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<Record<string, unknown>>;
  }

  /**
   * Fetch recent changes from the wiki.
   */
  async getRecentChanges(options?: {
    limit?: number;
    namespace?: number;
    rctype?: "edit" | "new" | "log";
  }): Promise<RecentChange[]> {
    const limit = options?.limit ?? 10;

    const data = await this.request({
      action: "query",
      list: "recentchanges",
      rcprop: "title|user|timestamp|comment|ids|sizes",
      rclimit: limit,
      ...(options?.namespace !== undefined && {
        rcnamespace: options.namespace,
      }),
      ...(options?.rctype && { rctype: options.rctype }),
    });

    const query = data.query as
      | { recentchanges?: RawRecentChange[] }
      | undefined;
    const changes = query?.recentchanges ?? [];
    return changes.map((rc) => {
      const oldlen = rc.oldlen ?? 0;
      const newlen = rc.newlen ?? 0;
      const diff = newlen - oldlen;
      return {
        pageId: rc.pageid ?? 0,
        revId: rc.revid ?? 0,
        title: rc.title ?? "",
        user: rc.user ?? "",
        timestamp: rc.timestamp ?? "",
        comment: rc.comment ?? "",
        type: rc.type ?? "edit",
        oldlen,
        newlen,
        diff,
      };
    });
  }

  /**
   * Get basic site statistics.
   */
  async getSiteStats(): Promise<SiteStats> {
    const data = await this.request({
      action: "query",
      meta: "siteinfo",
      siprop: "statistics",
    });

    const query = data.query as { statistics?: RawSiteStats } | undefined;
    const stats = query?.statistics ?? {};
    return {
      pages: Number(stats.pages) || 0,
      articles: Number(stats.articles) || 0,
      edits: Number(stats.edits) || 0,
      users: Number(stats.users) || 0,
      activeUsers: Number(stats.activeusers) || 0,
    };
  }

  /**
   * Get page info by title.
   */
  async getPageInfo(title: string): Promise<PageInfo | null> {
    const data = await this.request({
      action: "query",
      prop: "info|revisions",
      inprop: "url",
      rvprop: "timestamp|user|comment",
      rvlimit: 1,
      titles: title,
    });

    const query = data.query as { pages?: Record<string, RawPage> } | undefined;
    const pages = query?.pages;
    if (!pages) {
      return null;
    }

    const page = Object.values(pages)[0];
    if (!page || page.missing) {
      return null;
    }

    const rev = page.revisions?.[0];
    return {
      pageId: page.pageid ?? 0,
      title: page.title ?? title,
      fullUrl: page.fullurl ?? "",
      lastRevId: rev?.revid,
      lastModified: rev?.timestamp,
      lastModifiedBy: rev?.user,
    };
  }
}

/** Recent change from MediaWiki API */
export interface RecentChange {
  comment: string;
  /** newlen - oldlen; positive = bytes added, negative = bytes removed */
  diff: number;
  newlen: number;
  oldlen: number;
  pageId: number;
  revId: number;
  timestamp: string;
  title: string;
  type: string;
  user: string;
}

/** Site statistics */
export interface SiteStats {
  activeUsers: number;
  articles: number;
  edits: number;
  pages: number;
  users: number;
}

/** Page info */
export interface PageInfo {
  fullUrl: string;
  lastModified?: string;
  lastModifiedBy?: string;
  lastRevId?: number;
  pageId: number;
  title: string;
}

interface RawRecentChange {
  comment?: string;
  newlen?: number;
  oldlen?: number;
  pageid?: number;
  revid?: number;
  timestamp?: string;
  title?: string;
  type?: string;
  user?: string;
}

interface RawSiteStats {
  activeusers?: number;
  articles?: number;
  edits?: number;
  pages?: number;
  users?: number;
}

interface RawPage {
  fullurl?: string;
  missing?: boolean;
  pageid?: number;
  revisions?: Array<{
    revid?: number;
    timestamp?: string;
    user?: string;
    comment?: string;
  }>;
  title?: string;
}

export const mediawiki = new MediaWikiClient();
