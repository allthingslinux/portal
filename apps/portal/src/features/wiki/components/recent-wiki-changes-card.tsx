import { ArrowUpRight, BookOpen } from "lucide-react";
import { formatRelativeTime } from "@portal/utils/date";

import { env } from "@/env";
import { fetchRecentWikiChanges } from "@/shared/wiki";

const API_PATH_REGEX = /\/w\/api\.php$/;
const ROOT_API_REGEX = /\/api\.php$/;

function getWikiBaseUrl(): string {
  const api = env.WIKI_API_URL;
  return api.replace(API_PATH_REGEX, "").replace(ROOT_API_REGEX, "") || api;
}

function formatDiff(diff: number): string {
  if (diff === 0) {
    return "±0";
  }
  return diff > 0 ? `+${diff}` : String(diff);
}

export async function RecentWikiChangesCard() {
  const changes = await fetchRecentWikiChanges();
  const wikiBaseUrl = getWikiBaseUrl();

  if (changes.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Recent Wiki Changes</h3>
        </div>
        <p className="mt-3 text-muted-foreground text-sm">
          No recent changes. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Recent Wiki Changes</h3>
        </div>
        <a
          className="font-medium text-primary text-xs hover:underline"
          href={wikiBaseUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          View all
        </a>
      </div>
      <ul className="flex flex-col gap-2">
        {changes.map((item) => (
          <li key={`${item.pageId}-${item.title}-${item.timestamp}`}>
            <a
              className="group flex flex-col gap-0.5 rounded-lg border border-border/60 px-3 py-2 transition-colors hover:bg-muted/50 dark:border-border/40"
              href={item.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-2 font-medium text-foreground text-sm group-hover:text-primary">
                  {item.title}
                </span>
                <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </div>
              <span className="text-muted-foreground text-xs">
                by {item.user} · {formatRelativeTime(item.timestamp)}
                {item.diff !== 0 && (
                  <span
                    className={
                      item.diff > 0
                        ? "ml-1 text-green-600 dark:text-green-500"
                        : "ml-1 text-red-600 dark:text-red-500"
                    }
                  >
                    · {formatDiff(item.diff)}
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
