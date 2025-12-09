"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useMemo } from "react";

import { getSupabaseClientKeys } from "../get-supabase-client-keys";

/**
 * @deprecated This hook should only be used for realtime subscriptions and legacy database queries.
 *
 * For authentication, use useSession from ~/core/auth/better-auth/hooks
 * For storage, use the storage utilities from ~/core/storage/supabase-storage
 * For database queries, use server actions with Drizzle
 *
 * This returns a minimal Supabase client (no auth) for:
 * - Realtime subscriptions (notifications)
 * - Legacy database queries (should be migrated to server actions)
 */
export function useSupabase() {
  return useMemo(() => {
    const keys = getSupabaseClientKeys();

    // Create a minimal Supabase client for realtime and database queries only
    // No authentication - NextAuth handles that
    const client = createClient(keys.url, keys.publicKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    // Return a client that has the methods needed for realtime and database
    return {
      channel: client.channel.bind(client),
      from: client.from.bind(client),
      // For identity linking - throws error indicating it's not implemented
      auth: {
        getUserIdentities: () => {
          throw new Error(
            "Identity linking is not yet implemented with NextAuth. Please configure NextAuth account linking."
          );
        },
      },
    } as unknown as SupabaseClient;
  }, []);
}
