"use client";

import type { Context } from "react";
import { useContext } from "react";

/**
 * Generic hook to access workspace context data.
 * Provides consistent error handling and type safety for workspace contexts.
 *
 * @param context - The React context to use
 * @param errorMessage - Error message to throw if context is not available
 * @returns The context value
 * @throws Error if context is not available
 */
export function useWorkspaceContext<T>(
  context: Context<T | null>,
  errorMessage: string
): T {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error(errorMessage);
  }

  return ctx;
}
