"use client";

import { createAuthHooks } from "@daveyplate/better-auth-tanstack";
import type { AnyUseQueryOptions } from "@tanstack/react-query";

import { authClient } from "./client";

/** ApiKey shape expected by ApiKeysCard (matches @daveyplate/better-auth-ui internal type) */
interface ApiKeyForList {
  createdAt: Date;
  expiresAt?: Date | null;
  id: string;
  metadata?: Record<string, unknown> | null;
  name?: string | null;
  start?: string | null;
  updatedAt: Date;
}

/**
 * TanStack Query-backed auth hooks.
 * Uses AuthQueryProvider's staleTime (default 60s) to avoid
 * redundant /api/auth/get-session calls on every re-render.
 */
const authHooks = createAuthHooks(authClient);
export const { useSession: useAuthSession } = authHooks;

/**
 * useListApiKeys normalized for Better Auth 1.5.
 * The API Key plugin's list endpoint now returns { apiKeys, total, limit, offset }
 * instead of a plain array. ApiKeysCard expects an array, so we normalize here.
 * Pending upstream fix: https://github.com/better-auth-ui/better-auth-ui/issues/345
 * @see https://docs.better-auth.com/blogs/1-5#api-key-plugin-moved-to-better-authapi-key
 */
export function useListApiKeys(options?: Partial<AnyUseQueryOptions>) {
  const result = authHooks.useListApiKeys(options);
  const raw = result.data;
  let data: ApiKeyForList[];
  if (Array.isArray(raw)) {
    data = raw;
  } else if (raw && "apiKeys" in raw) {
    data = (raw as { apiKeys: ApiKeyForList[] }).apiKeys ?? [];
  } else {
    data = [];
  }
  return { ...result, data };
}
