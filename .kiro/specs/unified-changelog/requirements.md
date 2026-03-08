# Requirements Document

## Introduction

The Unified Changelog feature aggregates release changelogs and commit history from all AllThingsLinux (ATL) GitHub organization repositories into a single, browsable view within the Portal dashboard. Community members can see what changed across all ATL projects in one place, filter by individual repository or entry type, and browse a chronological timeline that interleaves both releases and commits. Releases are visually highlighted to stand out, while commits are displayed in a compact format with conventional commit type badges. The feature fetches data from the GitHub REST API and presents it using the existing dashboard layout patterns.

## Glossary

- **Changelog_Page**: The dashboard page at `/app/changelog` that displays the unified changelog view
- **Changelog_Service**: The server-side module responsible for fetching and normalizing release and commit data from the GitHub API
- **Timeline_Entry**: A single item in the timeline, either a Release_Entry or a Commit_Entry, containing a type discriminator, date, and repository name
- **Release_Entry**: A Timeline_Entry of type `release` from a GitHub repository, containing a tag name, title, body (markdown), published date, repository name, and release URL; visually highlighted in the Timeline_View
- **Commit_Entry**: A Timeline_Entry of type `commit` from a GitHub repository, containing a commit SHA, commit message, author name, author avatar URL, committed date, and commit URL
- **Conventional_Commit_Type**: A prefix extracted from a commit message following the Conventional Commits specification (e.g., `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `perf`, `test`, `build`, `ci`); displayed as a colored pill/badge
- **Commit_Message_Parser**: The client-side utility that extracts the Conventional_Commit_Type and scope from a Commit_Entry message string
- **Repository_Filter**: A UI control that allows users to select one or more repositories to narrow the displayed Timeline_Entries
- **Entry_Type_Filter**: A UI control that allows users to filter the timeline by entry type: releases, commits, or both
- **Timeline_View**: The default chronological display mode that interleaves Release_Entries and Commit_Entries from all repositories sorted by date (newest first)
- **GitHub_API_Client**: The server-side HTTP client that communicates with the GitHub REST API to retrieve release and commit data
- **Repository_Config**: A configuration list defining which GitHub repositories are included in the changelog aggregation
- **Release_Body**: The markdown content of a GitHub release, rendered as HTML for display

## Requirements

### Requirement 1: Repository Configuration

**User Story:** As a maintainer, I want to define which GitHub repositories are included in the changelog, so that only relevant ATL projects appear.

#### Acceptance Criteria

1. THE Repository_Config SHALL define a list of GitHub repositories as objects containing an `owner`, `repo`, and `displayName`
2. THE Repository_Config SHALL be stored as a static configuration file within the Portal application source
3. WHEN a repository in the Repository_Config is unreachable, THE Changelog_Service SHALL exclude that repository from results and continue processing remaining repositories

### Requirement 2: Fetch GitHub Releases

**User Story:** As a community member, I want the portal to fetch release data from GitHub, so that I can see the latest changes without visiting each repository individually.

#### Acceptance Criteria

1. WHEN the Changelog_Page is loaded, THE Changelog_Service SHALL fetch releases from all repositories defined in the Repository_Config
2. THE Changelog_Service SHALL fetch releases from the GitHub REST API using the `GET /repos/{owner}/{repo}/releases` endpoint
3. THE Changelog_Service SHALL normalize each API response into a Release_Entry containing: repository display name, repository identifier, tag name, release title, Release_Body (markdown), published date, and release URL
4. THE Changelog_Service SHALL fetch repositories in parallel to minimize total load time
5. WHILE fetching releases, THE Changelog_Service SHALL use Next.js fetch caching with a revalidation interval defined in the Repository_Config

### Requirement 3: Fetch GitHub Commits

**User Story:** As a community member, I want the portal to fetch commit history from GitHub, so that I can see granular development activity beyond just releases.

#### Acceptance Criteria

1. WHEN the Changelog_Page is loaded, THE Changelog_Service SHALL fetch commits from all repositories defined in the Repository_Config
2. THE Changelog_Service SHALL fetch commits from the GitHub REST API using the `GET /repos/{owner}/{repo}/commits` endpoint
3. THE Changelog_Service SHALL normalize each commit API response into a Commit_Entry containing: repository display name, repository identifier, commit SHA (abbreviated to 7 characters for display), full commit message, author name, author avatar URL, committed date, and commit URL
4. THE Changelog_Service SHALL fetch commits in parallel alongside releases to minimize total load time
5. WHILE fetching commits, THE Changelog_Service SHALL use Next.js fetch caching with a revalidation interval defined in the Repository_Config
6. THE Changelog_Service SHALL limit the number of commits fetched per repository to a configurable maximum (defined in Repository_Config) to avoid excessive API usage

### Requirement 4: Unified Timeline View

**User Story:** As a community member, I want to see all releases and commits across projects in a single chronological timeline, so that I can understand what changed recently across the ATL ecosystem.

#### Acceptance Criteria

1. THE Timeline_View SHALL display all Timeline_Entries (both Release_Entries and Commit_Entries) sorted by date in descending order (newest first)
2. THE Timeline_View SHALL visually distinguish Release_Entries from Commit_Entries using distinct styling
3. THE Timeline_View SHALL render Release_Entries with a highlighted treatment including: a release icon, a prominent border or background color, the repository display name, tag name, release title, published date, and a rendered Release_Body
4. THE Timeline_View SHALL render Commit_Entries in a compact format including: the author avatar, author name, commit SHA, commit message summary (first line), repository display name, and committed date
5. THE Timeline_View SHALL render the Release_Body markdown as formatted HTML
6. WHEN no Timeline_Entries are available from any repository, THE Changelog_Page SHALL display an empty state message indicating no activity was found

### Requirement 5: Conventional Commit Parsing and Display

**User Story:** As a community member, I want commit messages with conventional commit formatting to be visually parsed, so that I can quickly identify the type of change each commit represents.

#### Acceptance Criteria

1. THE Commit_Message_Parser SHALL extract the Conventional_Commit_Type prefix from a commit message when the message matches the pattern `type(scope): description` or `type: description`
2. THE Commit_Message_Parser SHALL recognize the following Conventional_Commit_Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `perf`, `test`, `build`, `ci`
3. WHEN a Commit_Entry message contains a recognized Conventional_Commit_Type, THE Timeline_View SHALL display the type as a colored pill/badge preceding the commit description
4. THE Timeline_View SHALL assign a distinct color to each Conventional_Commit_Type so that different types are visually distinguishable
5. WHEN a Commit_Entry message does not match any recognized Conventional_Commit_Type pattern, THE Timeline_View SHALL display the full commit message without a type badge
6. WHEN a Commit_Entry message contains a scope (e.g., `feat(auth): ...`), THE Commit_Message_Parser SHALL extract the scope and THE Timeline_View SHALL display the scope text adjacent to the type badge
7. FOR ALL valid conventional commit messages, parsing then formatting then parsing SHALL produce an equivalent Conventional_Commit_Type and scope (round-trip property)

### Requirement 6: Repository Filtering

**User Story:** As a community member, I want to filter the changelog by specific repositories, so that I can focus on changes relevant to the projects I care about.

#### Acceptance Criteria

1. THE Repository_Filter SHALL display a list of all repositories defined in the Repository_Config
2. WHEN a user selects one or more repositories in the Repository_Filter, THE Timeline_View SHALL display only Timeline_Entries from the selected repositories
3. WHEN no repositories are selected in the Repository_Filter, THE Timeline_View SHALL display Timeline_Entries from all repositories
4. THE Repository_Filter SHALL indicate the count of available Timeline_Entries per repository
5. WHEN a filter selection changes, THE Changelog_Page SHALL update the displayed Timeline_Entries without a full page reload

### Requirement 7: Entry Type Filtering

**User Story:** As a community member, I want to filter the timeline by entry type (releases or commits), so that I can focus on the level of detail I care about.

#### Acceptance Criteria

1. THE Entry_Type_Filter SHALL provide options to show: all entries, releases only, or commits only
2. WHEN the user selects "releases only" in the Entry_Type_Filter, THE Timeline_View SHALL display only Release_Entries
3. WHEN the user selects "commits only" in the Entry_Type_Filter, THE Timeline_View SHALL display only Commit_Entries
4. WHEN the user selects "all entries" in the Entry_Type_Filter, THE Timeline_View SHALL display both Release_Entries and Commit_Entries
5. THE Entry_Type_Filter SHALL work in combination with the Repository_Filter so that both filters apply simultaneously
6. WHEN a filter selection changes, THE Changelog_Page SHALL update the displayed Timeline_Entries without a full page reload

### Requirement 8: Pagination

**User Story:** As a community member, I want the changelog to load incrementally, so that the page remains responsive even with many entries.

#### Acceptance Criteria

1. THE Timeline_View SHALL initially display a limited number of Timeline_Entries (configurable page size)
2. WHEN the user requests more entries, THE Timeline_View SHALL load and append the next page of Timeline_Entries
3. WHEN all Timeline_Entries have been displayed, THE Timeline_View SHALL indicate that no more entries are available

### Requirement 9: Error Handling

**User Story:** As a community member, I want the changelog to handle errors gracefully, so that a single failing repository does not break the entire view.

#### Acceptance Criteria

1. IF the GitHub_API_Client receives a non-success HTTP response from a repository, THEN THE Changelog_Service SHALL log the error and exclude that repository from the current response
2. IF the GitHub_API_Client encounters a network timeout, THEN THE Changelog_Service SHALL skip the timed-out repository and return results from the remaining repositories
3. IF all repositories fail to return data, THEN THE Changelog_Page SHALL display an error state message indicating that changelog data is temporarily unavailable
4. IF the GitHub API returns a rate-limit response (HTTP 403/429), THEN THE Changelog_Service SHALL serve previously cached data when available

### Requirement 10: Release Detail Linking

**User Story:** As a community member, I want to navigate to the original GitHub release page, so that I can see the full context including assets and discussion.

#### Acceptance Criteria

1. THE Timeline_View SHALL display a link on each Release_Entry that opens the original GitHub release page in a new browser tab
2. THE Timeline_View SHALL display a link on each Commit_Entry that opens the original GitHub commit page in a new browser tab
3. THE Timeline_View SHALL set `rel="noopener noreferrer"` on all external GitHub links

### Requirement 11: Authentication-Gated Access

**User Story:** As a maintainer, I want the changelog page to be accessible only to authenticated users, so that it aligns with the Portal's access model.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to the Changelog_Page, THE Changelog_Page SHALL redirect the user to the authentication page
2. WHEN an authenticated user navigates to the Changelog_Page, THE Changelog_Page SHALL display the Timeline_View
