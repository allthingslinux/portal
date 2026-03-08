# Implementation Plan: Unified Changelog

## Overview

Implement a unified changelog page at `/app/changelog` that aggregates GitHub releases and commits from configured ATL repositories into a chronological timeline. Follows the existing Feed page pattern: server-side data fetching via RSC with Next.js `fetch` caching, client-side filtering/pagination, and the feature module structure.

## Tasks

- [x] 1. Create configuration and type foundations
  - [x] 1.1 Create the changelog types file at `features/changelog/lib/types.ts`
    - Define `ConventionalCommitType` union type, `ReleaseEntry`, `CommitEntry`, `TimelineEntry` discriminated union, `RepoFetchResult<T>`, `ChangelogResult`, `RepoSummary`, `RepoError`, and `ParsedCommitMessage` interfaces
    - Define `COMMIT_TYPE_COLORS` mapping each `ConventionalCommitType` to distinct Tailwind classes (light + dark mode)
    - _Requirements: 2.3, 3.3, 5.2, 5.4_

  - [x] 1.2 Create the changelog configuration at `shared/config/changelog.ts`
    - Define `RepoConfig` interface with `owner`, `repo`, `displayName`
    - Export `CHANGELOG_REPOS` array with ATL repositories (portal, tux, etc.)
    - Export `CHANGELOG_REVALIDATE_SECONDS` (600), `CHANGELOG_MAX_COMMITS_PER_REPO` (30), `CHANGELOG_PAGE_SIZE` (30)
    - Create `keys()` function using `createEnv` with optional `GITHUB_TOKEN` server env var
    - Register the changelog keys in `apps/portal/src/env.ts` extends array
    - _Requirements: 1.1, 1.2, 2.5, 3.5, 3.6_

  - [x] 1.3 Create the conventional commit parser at `features/changelog/lib/parser.ts`
    - Implement `parseConventionalCommit(message: string): ParsedCommitMessage` using a single regex matching `type(scope)!: description` against the first line
    - Return parsed `type`, `scope`, `description`, and `breaking` flag when the type is in the recognized set
    - Return `type: null`, `scope: null`, full first line as `description` when no match
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

  - [ ]* 1.4 Write property tests for the conventional commit parser at `tests/features/changelog/parser.property.test.ts`
    - **Property 5: Conventional commit parser correctness**
    - **Property 6: Each conventional commit type has a unique color**
    - **Property 7: Conventional commit parse-format round trip**
    - **Validates: Requirements 5.1, 5.2, 5.4, 5.5, 5.6, 5.7**

  - [ ]* 1.5 Write unit tests for the conventional commit parser at `tests/features/changelog/parser.test.ts`
    - Test known conventional commit examples (`feat: add login`, `fix(auth): resolve token issue`, `feat!: breaking change`)
    - Test non-matching messages, empty strings, multi-line messages
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [x] 2. Implement the changelog service layer
  - [x] 2.1 Create the changelog service at `features/changelog/lib/service.ts`
    - Implement `buildGitHubHeaders()` that adds `Accept`, `User-Agent`, and optional `Authorization: Bearer` header when `GITHUB_TOKEN` is set
    - Implement `normalizeReleases(data, repo)` and `normalizeCommits(data, repo)` to transform GitHub API responses into `ReleaseEntry[]` and `CommitEntry[]`
    - Implement `fetchRepoReleases(repo)` using `fetch` with `next: { revalidate }` and `AbortSignal.timeout(10_000)`
    - Implement `fetchRepoCommits(repo)` with the same caching/timeout pattern, limiting results to `CHANGELOG_MAX_COMMITS_PER_REPO`
    - Implement `fetchChangelog(repos)` using `Promise.allSettled` to fetch all repos in parallel, returning `ChangelogResult` with sorted entries, repo summaries, and errors
    - Handle non-success HTTP responses, network timeouts, and malformed JSON by returning empty entries with error info
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 9.1, 9.2, 9.3, 9.4_

  - [ ]* 2.2 Write property tests for the changelog service at `tests/features/changelog/service.property.test.ts`
    - **Property 1: Failed repos are excluded, successful repos are included**
    - **Property 2: Normalization produces complete entries**
    - **Property 3: Commit count is capped per repository**
    - **Property 4: Timeline entries are sorted by date descending**
    - **Validates: Requirements 1.3, 2.3, 3.3, 3.6, 4.1, 9.1, 9.2**

  - [ ]* 2.3 Write unit tests for the changelog service at `tests/features/changelog/service.test.ts`
    - Test specific GitHub API response shapes and normalization
    - Test empty response handling, all-repos-fail scenario, rate-limit behavior
    - _Requirements: 2.3, 3.3, 9.1, 9.2, 9.3_

- [x] 3. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Build the timeline UI components
  - [x] 4.1 Create the `CommitTypeBadge` component at `features/changelog/components/commit-type-badge.tsx`
    - Render a colored pill/badge using `COMMIT_TYPE_COLORS` for the given `ConventionalCommitType`
    - Display scope text adjacent to the type badge when present
    - _Requirements: 5.3, 5.4, 5.6_

  - [x] 4.2 Create the `ReleaseCard` component at `features/changelog/components/release-card.tsx`
    - Render a highlighted card with release icon, prominent border/background, repo display name, tag name, release title, published date
    - Render the `Release_Body` markdown as formatted HTML
    - Include an external link to the GitHub release page with `rel="noopener noreferrer"` and `target="_blank"`
    - _Requirements: 4.2, 4.3, 4.5, 10.1, 10.3_

  - [x] 4.3 Create the `CommitRow` component at `features/changelog/components/commit-row.tsx`
    - Render a compact row with author avatar, author name, commit SHA (7-char), commit message summary (first line), repo display name, committed date
    - Use `parseConventionalCommit` to extract type/scope and render `CommitTypeBadge` when applicable
    - Include an external link to the GitHub commit page with `rel="noopener noreferrer"` and `target="_blank"`
    - _Requirements: 4.4, 5.3, 5.5, 10.2, 10.3_

  - [x] 4.4 Create the `RepositoryFilter` component at `features/changelog/components/repository-filter.tsx`
    - Render a multi-select toggle list of repos from `RepoSummary[]`
    - Show entry count per repository
    - When none selected, all repos are shown (no filtering)
    - Trigger filter changes via callback without page reload
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.5 Create the `EntryTypeFilter` component at `features/changelog/components/entry-type-filter.tsx`
    - Render a segmented control with three options: All, Releases, Commits
    - Trigger filter changes via callback without page reload
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

  - [x] 4.6 Create the `TimelineView` component at `features/changelog/components/timeline-view.tsx`
    - Render a list of `TimelineEntry` items, dispatching to `ReleaseCard` or `CommitRow` based on entry type
    - Accept `visibleCount` prop and render `entries.slice(0, visibleCount)`
    - Render a "Load more" button when more entries are available
    - Render an empty state when no entries are available
    - _Requirements: 4.1, 4.2, 4.6, 8.1, 8.2, 8.3_

- [x] 5. Wire up the changelog page
  - [x] 5.1 Create the `ChangelogContent` client component at `app/(dashboard)/app/changelog/changelog-content.tsx`
    - Accept `entries: TimelineEntry[]` and `repos: RepoSummary[]` as props
    - Manage client-side state for selected repos, entry type filter, and `visibleCount`
    - Compute `filteredEntries` via `useMemo` applying both repo and type filters simultaneously
    - Reset `visibleCount` when filters change
    - Render `RepositoryFilter`, `EntryTypeFilter`, and `TimelineView`
    - Display error state when all repos failed (entries empty, errors present)
    - _Requirements: 6.2, 6.3, 6.5, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 9.3_

  - [x] 5.2 Create the RSC page at `app/(dashboard)/app/changelog/page.tsx`
    - Call `verifySession()` for authentication gating
    - Call `fetchChangelog(CHANGELOG_REPOS)` to fetch all data server-side
    - Generate route metadata using `getRouteMetadata`
    - Pass entries, repos, and errors to `ChangelogContent`
    - Use `PageContent` and `PageHeader` layout components matching the Feed page pattern
    - _Requirements: 2.1, 3.1, 4.1, 11.1, 11.2_

  - [x] 5.3 Register the changelog route in the routing configuration
    - Add `/app/changelog` to the route config in `features/routing/lib` with appropriate label, icon, and breadcrumb
    - _Requirements: 11.1, 11.2_

  - [ ]* 5.4 Write property tests for filtering and pagination at `tests/features/changelog/filter.property.test.ts`
    - **Property 8: Combined filtering returns the intersection of repo and type filters**
    - **Property 9: Repository entry counts are accurate**
    - **Property 10: Pagination displays correct number of entries**
    - **Validates: Requirements 6.2, 6.3, 6.4, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2**

  - [ ]* 5.5 Write unit tests for filtering logic at `tests/features/changelog/filter.test.ts`
    - Test empty entry list filtering, single repo selection, empty state display trigger
    - _Requirements: 4.6, 6.2, 6.3_

- [x] 6. Final checkpoint
  - Ensure all tests pass, run `pnpm fix` for formatting, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Authentication is handled by the existing dashboard layout + `verifySession()` — no custom auth logic needed
- The design uses plain `fetch` (not Octokit) for GitHub API calls with Next.js ISR caching
- Property tests use `fast-check` v4 (already a devDependency)
- Checkpoints ensure incremental validation
