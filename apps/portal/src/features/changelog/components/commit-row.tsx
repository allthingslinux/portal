import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { parseConventionalCommit } from "../lib/parser";
import type { CommitEntry } from "../lib/types";
import { CommitTypeBadge } from "./commit-type-badge";
import { RepoIcon } from "./repo-icon";

interface CommitRowProps {
  entry: CommitEntry;
}

export function CommitRow({ entry }: CommitRowProps) {
  const parsed = parseConventionalCommit(entry.message);

  const formattedDate = new Date(entry.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 dark:border-border/40">
      {/* 1. Repo */}
      <span className="mr-2 inline-flex w-32 shrink-0 items-center gap-1.5 border-border/60 border-r pr-3 dark:border-border/40">
        <RepoIcon repoId={entry.repoId} />
        <span className="truncate font-mono text-foreground text-xs">
          {entry.repoDisplayName}
        </span>
      </span>

      {/* 2. Type badge  3. Scope */}
      {parsed.type ? (
        <CommitTypeBadge scope={parsed.scope} type={parsed.type} />
      ) : null}

      {/* 4. Commit description (flexible, takes remaining space) */}
      <span className="min-w-0 flex-1 truncate text-foreground text-sm">
        {parsed.type ? parsed.description : parsed.description}
      </span>

      {/* 5. SHA */}
      <span className="shrink-0 font-mono text-muted-foreground text-xs">
        {entry.shortSha}
      </span>

      {/* 6. Author */}
      <Image
        alt={entry.authorName}
        className="size-5 shrink-0 rounded-full"
        height={20}
        src={entry.authorAvatarUrl}
        width={20}
      />
      <span className="shrink-0 text-muted-foreground text-xs">
        {entry.authorName}
      </span>

      {/* 7. Timestamp */}
      <span className="shrink-0 text-muted-foreground text-xs">
        {formattedDate}
      </span>
      <a
        className="inline-flex shrink-0 items-center rounded-md px-1 py-1 text-muted-foreground text-xs transition-colors hover:bg-muted hover:text-foreground"
        href={entry.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ArrowUpRight className="size-3" />
      </a>
    </div>
  );
}
