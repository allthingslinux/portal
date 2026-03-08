import type { RepoSummary } from "../lib/types";

interface RepositoryFilterProps {
  onToggle: (repoId: string) => void;
  repos: RepoSummary[];
  selectedRepos: Set<string>;
}

export function RepositoryFilter({
  repos,
  selectedRepos,
  onToggle,
}: RepositoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {repos.map((repo) => {
        const active = selectedRepos.has(repo.repoId);
        return (
          <button
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-medium text-xs transition-colors ${
              active
                ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                : "border-border/50 bg-transparent text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40"
            }`}
            key={repo.repoId}
            onClick={() => onToggle(repo.repoId)}
            type="button"
          >
            {repo.displayName}
            <span className="tabular-nums opacity-70">{repo.entryCount}</span>
          </button>
        );
      })}
    </div>
  );
}
