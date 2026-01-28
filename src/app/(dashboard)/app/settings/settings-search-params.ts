/**
 * nuqs parsers for account settings tab URL state.
 * Import from "nuqs/server" so parsers can be reused in createLoader (server)
 * and in useQueryStates (client). See docs/NUQS.md.
 */
import {
  createLoader,
  type inferParserType,
  parseAsStringLiteral,
} from "nuqs/server";

export const settingsTabParsers = {
  tab: parseAsStringLiteral(["account", "security", "api-keys"]).withDefault(
    "account"
  ),
} as const;

export type SettingsTabUrlState = inferParserType<typeof settingsTabParsers>;

/** Parse settings search params server-side. Accepts Request, URLSearchParams, or Promise thereof. */
export const loadSettingsSearchParams = createLoader(settingsTabParsers);
