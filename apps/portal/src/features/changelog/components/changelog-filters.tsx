import { GitCommitHorizontal, Tag, X } from "lucide-react";
import { cn } from "@portal/utils/utils";

import {
  COMMIT_TYPE_COLORS,
  type ConventionalCommitType,
  type RepoSummary,
} from "../lib/types";
import { RepoIcon } from "./repo-icon";

export type EntryTypeFilterValue = "all" | "releases" | "commits";

const ENTRY_TYPE_OPTIONS: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: EntryTypeFilterValue;
}[] = [
  { icon: GitCommitHorizontal, label: "Commits", value: "commits" },
  { icon: Tag, label: "Releases", value: "releases" },
];

const COMMIT_TYPES: ConventionalCommitType[] = [
  "feat",
  "fix",
  "refactor",
  "chore",
  "docs",
  "style",
  "perf",
  "test",
  "build",
  "ci",
];

interface ChangelogFiltersProps {
  entryType: EntryTypeFilterValue;
  onCommitTypeToggle: (type: ConventionalCommitType) => void;
  onEntryTypeChange: (value: EntryTypeFilterValue) => void;
  onRepoToggle: (repoId: string) => void;
  onReset: () => void;
  repos: RepoSummary[];
  selectedCommitTypes: Set<ConventionalCommitType>;
  selectedRepos: Set<string>;
}

export function ChangelogFilters({
  entryType,
  onCommitTypeToggle,
  onEntryTypeChange,
  onRepoToggle,
  onReset,
  repos,
  selectedCommitTypes,
  selectedRepos,
}: ChangelogFiltersProps) {
  const hasActiveFilters =
    entryType !== "all" ||
    selectedRepos.size > 0 ||
    selectedCommitTypes.size > 0;

  return (
    <div className="rounded-xl border border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30">
      {/* Top row: entry type tabs + count + reset */}
      <div className="flex items-center justify-between border-border/60 border-b px-4 py-3 dark:border-border/40">
        <div className="flex items-center gap-1.5">
          <button
            className={cn(
              "rounded-md border px-2.5 py-1 font-medium text-xs transition-colors",
              entryType === "all"
                ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40"
            )}
            onClick={() => onEntryTypeChange("all")}
            type="button"
          >
            All
          </button>
          {ENTRY_TYPE_OPTIONS.map((opt) => {
            const active = entryType === opt.value;
            return (
              <button
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-medium text-xs transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                    : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40"
                )}
                key={opt.value}
                onClick={() => onEntryTypeChange(opt.value)}
                type="button"
              >
                <opt.icon className="size-3" />
                {opt.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters ? (
            <button
              className="inline-flex items-center gap-1 rounded-md border border-border/50 px-2 py-0.5 text-muted-foreground text-xs transition-colors hover:border-border hover:text-foreground dark:border-border/40"
              onClick={onReset}
              type="button"
            >
              <X className="size-3" />
              Clear filters
            </button>
          ) : null}
        </div>
      </div>
      {/* Middle row: repos */}
      <div className="grid grid-cols-5 gap-1.5 border-border/60 border-b px-4 py-3 dark:border-border/40">
        {repos.map((repo) => {
          const active = selectedRepos.has(repo.repoId);
          return (
            <button
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 font-medium text-sm transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                  : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40"
              )}
              key={repo.repoId}
              onClick={() => onRepoToggle(repo.repoId)}
              type="button"
            >
              <RepoIcon className="size-3" repoId={repo.repoId} />
              {repo.displayName}
            </button>
          );
        })}
      </div>
      {/* Bottom row: commit types */}
      <div className="grid grid-cols-10 gap-1.5 px-4 py-3">
        {COMMIT_TYPES.map((ct) => {
          const active = selectedCommitTypes.has(ct);
          return (
            <button
              className={cn(
                "rounded-full px-3 py-1 font-medium text-sm transition-colors",
                active
                  ? COMMIT_TYPE_COLORS[ct]
                  : "border border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40"
              )}
              key={ct}
              onClick={() => onCommitTypeToggle(ct)}
              type="button"
            >
              {ct}
            </button>
          );
        })}
      </div>
    </div>
  );
}
