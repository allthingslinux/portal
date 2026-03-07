import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { Skeleton } from "@portal/ui/ui/skeleton";

import { isWikiApiConfigured } from "@/features/integrations/lib/mediawiki/keys";
import { fetchWikiStats } from "@/shared/wiki";

async function WikiSiteStatsContent() {
  if (!isWikiApiConfigured()) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="size-4 text-primary" />
          </div>
          <span className="font-medium text-muted-foreground text-sm">
            Wiki Stats
          </span>
        </div>
        <div className="mt-3">
          <div className="font-bold text-2xl text-foreground tabular-nums">
            —
          </div>
          <p className="mt-0.5 text-muted-foreground text-xs">Not configured</p>
        </div>
      </div>
    );
  }

  const stats = await fetchWikiStats();

  if (!stats) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="size-4 text-primary" />
          </div>
          <span className="font-medium text-muted-foreground text-sm">
            Wiki Stats
          </span>
        </div>
        <div className="mt-3">
          <div className="font-bold text-2xl text-foreground tabular-nums">
            —
          </div>
          <p className="mt-0.5 text-destructive text-xs">Failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
      <div className="flex items-center gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <BookOpen className="size-4 text-primary" />
        </div>
        <span className="font-medium text-muted-foreground text-sm">
          Wiki Stats
        </span>
      </div>
      <div className="mt-3">
        <div className="font-bold text-2xl text-foreground tabular-nums">
          {stats.articles.toLocaleString()}
        </div>
        <p className="mt-0.5 text-muted-foreground text-xs">
          {stats.edits.toLocaleString()} edits ·{" "}
          {stats.activeUsers.toLocaleString()} active users
        </p>
      </div>
    </div>
  );
}

export function WikiSiteStats() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
          <div className="flex items-center gap-2">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      }
    >
      <WikiSiteStatsContent />
    </Suspense>
  );
}
