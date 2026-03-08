import { cn } from "@portal/utils/utils";

import { COMMIT_TYPE_COLORS, type ConventionalCommitType } from "../lib/types";

interface CommitTypeBadgeProps {
  scope?: string | null;
  type: ConventionalCommitType;
}

export function CommitTypeBadge({ type, scope }: CommitTypeBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-medium text-xs",
          COMMIT_TYPE_COLORS[type]
        )}
      >
        {type}
      </span>
      {scope ? (
        <span className="rounded-full border border-border/50 px-1.5 py-0.5 text-muted-foreground text-xs dark:border-border/40">
          {scope}
        </span>
      ) : null}
    </span>
  );
}
