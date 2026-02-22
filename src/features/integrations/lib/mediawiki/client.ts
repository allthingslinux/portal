import { Mwn } from "mwn";

import { env } from "@/env";

/**
 * MediaWiki API client for read-only operations (recent changes, page info, etc.)
 * Uses mwn in anonymous mode — no login required for public wikis.
 */
class MediaWikiClient {
  private bot: Mwn | null = null;

  private getBot(): Mwn {
    if (this.bot) {
      return this.bot;
    }
    this.bot = new Mwn({
      apiUrl: env.WIKI_API_URL,
      userAgent: "Portal/1.0 (https://portal.atl.tools; contact@atl.dev)",
      defaultParams: {
        formatversion: 2,
      },
    });
    return this.bot;
  }

  /**
   * Fetch recent changes from the wiki.
   */
  async getRecentChanges(options?: {
    limit?: number;
    namespace?: number;
    rctype?: "edit" | "new" | "log";
  }): Promise<RecentChange[]> {
    const bot = this.getBot();
    const limit = options?.limit ?? 10;

    const params = {
      action: "query",
      list: "recentchanges",
      rcprop: "title|user|timestamp|comment|ids|sizes",
      rclimit: limit,
      ...(options?.namespace !== undefined && {
        rcnamespace: options.namespace,
      }),
      ...(options?.rctype && { rctype: options.rctype }),
    };

    const data = await bot.request(params);

    const changes = (data.query?.recentchanges ?? []) as RawRecentChange[];
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
    const bot = this.getBot();
    const data = await bot.request({
      action: "query",
      meta: "siteinfo",
      siprop: "statistics",
    });

    const stats = (data.query?.statistics ?? {}) as RawSiteStats;
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
    const bot = this.getBot();
    const data = await bot.request({
      action: "query",
      prop: "info|revisions",
      inprop: "url",
      rvprop: "timestamp|user|comment",
      rvlimit: 1,
      titles: title,
    });

    const pages = data.query?.pages as Record<string, RawPage> | undefined;
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
  pageId: number;
  revId: number;
  title: string;
  user: string;
  timestamp: string;
  comment: string;
  type: string;
  oldlen: number;
  newlen: number;
  /** newlen - oldlen; positive = bytes added, negative = bytes removed */
  diff: number;
}

/** Site statistics */
export interface SiteStats {
  pages: number;
  articles: number;
  edits: number;
  users: number;
  activeUsers: number;
}

/** Page info */
export interface PageInfo {
  pageId: number;
  title: string;
  fullUrl: string;
  lastRevId?: number;
  lastModified?: string;
  lastModifiedBy?: string;
}

interface RawRecentChange {
  pageid?: number;
  revid?: number;
  title?: string;
  user?: string;
  timestamp?: string;
  comment?: string;
  type?: string;
  oldlen?: number;
  newlen?: number;
}

interface RawSiteStats {
  pages?: number;
  articles?: number;
  edits?: number;
  users?: number;
  activeusers?: number;
}

interface RawPage {
  pageid?: number;
  title?: string;
  fullurl?: string;
  missing?: boolean;
  revisions?: Array<{
    revid?: number;
    timestamp?: string;
    user?: string;
    comment?: string;
  }>;
}

export const mediawiki = new MediaWikiClient();
