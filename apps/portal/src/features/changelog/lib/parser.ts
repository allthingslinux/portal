import type { ConventionalCommitType, ParsedCommitMessage } from "./types";

/**
 * Set of recognized conventional commit type prefixes.
 */
const CONVENTIONAL_TYPES = new Set<string>([
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
]);

/**
 * Aliases for common misspellings or pluralizations of commit types.
 */
const TYPE_ALIASES: Record<string, ConventionalCommitType> = {
  tests: "test",
};

/**
 * Regex matching the conventional commit pattern on a single line:
 *   type(scope)!: description
 *
 * Groups:
 *   1 - type (e.g. "feat")
 *   2 - scope including parens (e.g. "(auth)"), optional
 *   3 - scope text without parens (e.g. "auth"), optional
 *   4 - "!" breaking indicator, optional
 *   5 - description (text after ": ")
 */
const CONVENTIONAL_COMMIT_RE = /^(\w+)(\(([^)]*)\))?(!)?: (.+)$/;

/**
 * Parse a commit message for conventional commit format.
 *
 * Only the first line of the message is considered. If the first line matches
 * the conventional commit pattern and the type is in the recognized set, the
 * parsed type, scope, description, and breaking flag are returned. Otherwise,
 * type and scope are null and description is the full first line.
 */
export function parseConventionalCommit(message: string): ParsedCommitMessage {
  const firstLine = message.split("\n")[0] ?? "";

  const match = CONVENTIONAL_COMMIT_RE.exec(firstLine);

  if (match) {
    const rawType = match[1] ?? "";
    const normalizedType = TYPE_ALIASES[rawType] ?? rawType;
    const scope = match[3] ?? null;
    const bang = match[4] === "!";
    const description = match[5] ?? "";

    if (CONVENTIONAL_TYPES.has(normalizedType)) {
      return {
        type: normalizedType as ConventionalCommitType,
        scope,
        description,
        breaking: bang,
      };
    }
  }

  return {
    type: null,
    scope: null,
    description: firstLine,
    breaking: false,
  };
}
