"use client";

import { useQueryStates } from "nuqs";

import { settingsTabParsers } from "./settings-search-params";

/**
 * Encapsulates settings tab URL state (account | security | api-keys).
 * Use in SettingsContent so the active tab is reflected in the URL and
 * deep links / back-forward work. See docs/NUQS.md.
 */
export function useSettingsSearchParams() {
  return useQueryStates(settingsTabParsers);
}
