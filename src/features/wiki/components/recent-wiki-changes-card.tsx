import { env } from "@/env";
import { formatRelativeTime } from "@/shared/utils/date";
import { fetchRecentWikiChanges } from "@/shared/wiki";

const API_PATH_REGEX = /\/w\/api\.php$/;
const ROOT_API_REGEX = /\/api\.php$/;

function getWikiBaseUrl(): string {
  const api = env.WIKI_API_URL;
  return api.replace(API_PATH_REGEX, "").replace(ROOT_API_REGEX, "") || api;
}

export async function RecentWikiChangesCard() {
  const changes = await fetchRecentWikiChanges();
  const wikiBaseUrl = getWikiBaseUrl();

  if (changes.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium text-foreground">Recent Wiki Changes</h3>
          <a
            className="font-medium text-primary text-xs hover:underline"
            href={wikiBaseUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            View all
          </a>
        </div>
        <p className="text-muted-foreground text-sm">
          No recent changes. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-foreground">Recent Wiki Changes</h3>
        <a
          className="font-medium text-primary text-xs hover:underline"
          href={wikiBaseUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          View all
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="border-border/60 border-b text-left">
              <th className="h-9 px-3 py-2 font-medium text-muted-foreground uppercase tracking-wider">
                Page
              </th>
              <th className="h-9 px-3 py-2 font-medium text-muted-foreground uppercase tracking-wider">
                User
              </th>
              <th className="h-9 px-3 py-2 font-medium text-muted-foreground uppercase tracking-wider">
                When
              </th>
              <th className="h-9 w-20 px-3 py-2 text-right font-medium text-muted-foreground uppercase tracking-wider">
                Diff
              </th>
            </tr>
          </thead>
          <tbody>
            {changes.map((item) => (
              <tr
                className="border-border/40 border-b transition-colors last:border-0 hover:bg-muted/30"
                key={`${item.pageId}-${item.title}-${item.timestamp}`}
              >
                <td className="min-w-[160px] px-3 py-2.5">
                  <a
                    className="block break-words font-medium text-foreground hover:text-primary hover:underline"
                    href={item.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {item.title}
                  </a>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                  {item.user}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className="rounded bg-muted/50 px-1.5 py-0.5 text-muted-foreground tabular-nums">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  {item.diff !== 0 ? (
                    <span
                      className={
                        item.diff > 0
                          ? "inline-block rounded bg-green-500/15 px-1.5 py-0.5 font-medium text-green-600 tabular-nums dark:text-green-500"
                          : "inline-block rounded bg-red-500/15 px-1.5 py-0.5 font-medium text-red-600 tabular-nums dark:text-red-500"
                      }
                    >
                      {item.diff > 0 ? "+" : ""}
                      {item.diff}
                    </span>
                  ) : (
                    <span className="inline-block rounded bg-muted/50 px-1.5 py-0.5 text-muted-foreground tabular-nums">
                      ±0
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
