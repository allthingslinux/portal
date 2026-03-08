import {
  ArrowUpRight,
  GitCommitHorizontal,
  Minus,
  Plus,
  Tag,
  Users,
} from "lucide-react";

import type { ReleaseEntry } from "../lib/types";
import { RepoIcon } from "./repo-icon";

interface ReleaseCardProps {
  entry: ReleaseEntry;
}

export function ReleaseCard({ entry }: ReleaseCardProps) {
  const formattedDate = new Date(entry.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const hasStats = entry.commitCount != null || entry.contributors != null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 dark:border-green-500/20 dark:bg-green-500/5">
      <span className="mr-2 inline-flex w-32 shrink-0 items-center gap-1.5 border-border/60 border-r pr-3 dark:border-border/40">
        <RepoIcon className="size-4 text-foreground" repoId={entry.repoId} />
        <span className="truncate font-mono text-foreground text-sm">
          {entry.repoDisplayName}
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-800 px-2.5 py-1 font-medium text-green-100 text-sm dark:bg-green-900 dark:text-green-300">
        <Tag className="size-3.5" />
        release
      </span>
      <span className="shrink-0 font-mono text-foreground/70 text-sm">
        {entry.tagName}
      </span>
      {entry.title && entry.title !== entry.tagName ? (
        <span className="min-w-0 flex-1 truncate text-base text-foreground">
          {entry.title}
        </span>
      ) : (
        <span className="flex-1" />
      )}
      {hasStats ? (
        <span className="inline-flex shrink-0 items-center gap-2.5">
          {entry.commitCount != null ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
              <GitCommitHorizontal className="size-3" />
              {entry.commitCount}
            </span>
          ) : null}
          {entry.contributors != null ? (
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
              <Users className="size-3" />
              {entry.contributors}
            </span>
          ) : null}
          {entry.additions != null ? (
            <span className="inline-flex items-center gap-0.5 font-mono text-green-600 text-xs dark:text-green-400">
              <Plus className="size-3" />
              {entry.additions.toLocaleString()}
            </span>
          ) : null}
          {entry.deletions != null ? (
            <span className="inline-flex items-center gap-0.5 font-mono text-red-500 text-xs dark:text-red-400">
              <Minus className="size-3" />
              {entry.deletions.toLocaleString()}
            </span>
          ) : null}
        </span>
      ) : null}
      <span className="shrink-0 text-muted-foreground text-sm">
        {formattedDate}
      </span>
      <span className="inline-flex shrink-0 items-center gap-1">
        {entry.compareUrl ? (
          <a
            className="inline-flex items-center rounded-md px-1 py-1 text-muted-foreground text-xs transition-colors hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400"
            href={entry.compareUrl}
            rel="noopener noreferrer"
            target="_blank"
            title="View diff"
          >
            <GitCommitHorizontal className="size-3" />
          </a>
        ) : null}
        <a
          className="inline-flex items-center rounded-md px-1 py-1 text-muted-foreground text-xs transition-colors hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400"
          href={entry.url}
          rel="noopener noreferrer"
          target="_blank"
          title="View release"
        >
          <ArrowUpRight className="size-3" />
        </a>
      </span>
    </div>
  );
}
