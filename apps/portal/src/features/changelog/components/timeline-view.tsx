import { useEffect, useRef } from "react";
import { History } from "lucide-react";

import type { TimelineEntry } from "../lib/types";
import { CommitRow } from "./commit-row";
import { ReleaseCard } from "./release-card";

interface TimelineViewProps {
  entries: TimelineEntry[];
  onLoadMore: () => void;
  visibleCount: number;
}

export function TimelineView({
  entries,
  onLoadMore,
  visibleCount,
}: TimelineViewProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < entries.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!(el && hasMore)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border/60 bg-card/50 py-16 dark:border-border/40 dark:bg-card/30">
        <History className="mb-3 size-8 text-muted-foreground/40" />
        <p className="font-medium text-foreground">No activity found</p>
        <p className="mt-1 text-muted-foreground text-sm">
          Try adjusting your filters.
        </p>
      </div>
    );
  }

  const visibleEntries = entries.slice(0, visibleCount);

  return (
    <div className="space-y-3">
      {visibleEntries.map((entry) =>
        entry.type === "release" ? (
          <ReleaseCard entry={entry} key={entry.id} />
        ) : (
          <CommitRow entry={entry} key={entry.id} />
        )
      )}

      {hasMore ? (
        <div className="h-px" ref={sentinelRef} />
      ) : (
        <p className="pt-2 text-center text-muted-foreground text-sm">
          No more entries
        </p>
      )}
    </div>
  );
}
