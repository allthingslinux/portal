/**
 * Changelog types for the unified changelog feature.
 *
 * Defines timeline entry types (releases and commits), service result types,
 * conventional commit parsing types, and commit type color mappings.
 */

/**
 * Recognized conventional commit type prefixes.
 */
export type ConventionalCommitType =
  | "feat"
  | "fix"
  | "refactor"
  | "chore"
  | "docs"
  | "style"
  | "perf"
  | "test"
  | "build"
  | "ci";

/**
 * A GitHub release entry in the timeline.
 */
export interface ReleaseEntry {
  /** Lines added */
  additions?: number;
  /** Release body in markdown */
  body: string;
  /** Number of commits since previous release */
  commitCount?: number;
  /** Compare URL on GitHub (this tag vs previous) */
  compareUrl?: string;
  /** Number of contributors in this release */
  contributors?: number;
  /** ISO 8601 date string */
  date: string;
  /** Lines deleted */
  deletions?: number;
  id: string;
  repoDisplayName: string;
  repoId: string;
  tagName: string;
  title: string;
  type: "release";
  /** GitHub release URL */
  url: string;
}

/**
 * A GitHub commit entry in the timeline.
 */
export interface CommitEntry {
  authorAvatarUrl: string;
  authorName: string;
  /** ISO 8601 date string */
  date: string;
  id: string;
  /** Full commit message */
  message: string;
  repoDisplayName: string;
  repoId: string;
  /** Full commit SHA */
  sha: string;
  /** 7-character abbreviated SHA */
  shortSha: string;
  type: "commit";
  /** GitHub commit URL */
  url: string;
}

/**
 * Discriminated union of all timeline entry types.
 */
export type TimelineEntry = ReleaseEntry | CommitEntry;

/**
 * Result of fetching entries from a single repository.
 */
export interface RepoFetchResult<T> {
  entries: T[];
  error?: string;
  repoDisplayName: string;
  repoId: string;
}

/**
 * Aggregated changelog result from all configured repositories.
 */
export interface ChangelogResult {
  /** All entries sorted by date descending */
  entries: TimelineEntry[];
  /** Repos that failed to fetch */
  errors: RepoError[];
  /** Summary per repo for filter UI */
  repos: RepoSummary[];
}

/**
 * Summary of a repository's contribution to the changelog.
 */
export interface RepoSummary {
  displayName: string;
  entryCount: number;
  repoId: string;
}

/**
 * Error info for a repository that failed to fetch.
 */
export interface RepoError {
  displayName: string;
  error: string;
  repoId: string;
}

/**
 * Result of parsing a commit message for conventional commit format.
 */
export interface ParsedCommitMessage {
  breaking: boolean;
  description: string;
  scope: string | null;
  type: ConventionalCommitType | null;
}

/**
 * Tailwind classes for each conventional commit type badge (light + dark mode).
 */
export const COMMIT_TYPE_COLORS: Record<ConventionalCommitType, string> = {
  feat: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  fix: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  refactor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  chore: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300",
  docs: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  style: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  perf: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  test: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  build:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  ci: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
};
