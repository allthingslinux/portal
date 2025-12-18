"use client";

import { useCallback, useEffect, useRef } from "react";

import { authClient } from "~/core/auth/better-auth";
import { useSyncUserFromKeycloak } from "~/core/auth/better-auth/hooks/use-sync-user-from-keycloak";
import { useMonitoring } from "~/core/monitoring/api/hooks/use-monitoring";
import { useAppEvents } from "~/shared/events";

export function AuthProvider(props: React.PropsWithChildren) {
  return <AuthEventDispatcher>{props.children}</AuthEventDispatcher>;
}

const SYNC_INTERVAL_MS = 5 * 60 * 1000;
const MIN_SYNC_COOLDOWN_MS = 60_000;

function AuthEventDispatcher({ children }: React.PropsWithChildren) {
  const { data: session, isPending } = authClient.useSession();
  const dispatchEvent = useDispatchAppEventFromAuthEvent();
  const syncUser = useSyncUserFromKeycloak();
  const lastSyncTimeRef = useRef<number>(0);
  const syncInProgressRef = useRef<boolean>(false);
  const userIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isPending && session?.user) {
      const userId = session.user.id;
      const isNewSession = userIdRef.current !== userId;

      if (isNewSession) {
        userIdRef.current = userId;
        dispatchEvent("SIGNED_IN", userId, {
          email: session.user.email || "",
        });
      }

      // Sync user data from Keycloak on session load (only once per session)
      // This ensures user profile changes in Keycloak are reflected without re-login
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncTimeRef.current;
      const shouldSync =
        isNewSession ||
        (timeSinceLastSync > MIN_SYNC_COOLDOWN_MS &&
          !syncInProgressRef.current);

      if (shouldSync) {
        syncInProgressRef.current = true;
        lastSyncTimeRef.current = now;
        syncUser.mutate(undefined, {
          onSettled: () => {
            syncInProgressRef.current = false;
          },
        });
      }
    }
  }, [isPending, session?.user, dispatchEvent, syncUser.mutate]);

  // Periodic sync every 5 minutes to keep user data fresh
  useEffect(() => {
    if (!session?.user) {
      return;
    }

    const interval = setInterval(() => {
      if (!syncInProgressRef.current) {
        syncInProgressRef.current = true;
        lastSyncTimeRef.current = Date.now();
        syncUser.mutate(undefined, {
          onSettled: () => {
            syncInProgressRef.current = false;
          },
        });
      }
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [session?.user, syncUser.mutate]);

  return <>{children}</>;
}

function useDispatchAppEventFromAuthEvent() {
  const { emit } = useAppEvents();
  const monitoring = useMonitoring();

  return useCallback(
    (
      type: "SIGNED_IN" | "SIGNED_OUT" | "USER_UPDATED",
      userId: string | undefined,
      traits: Record<string, string> = {}
    ) => {
      switch (type) {
        case "SIGNED_IN":
          if (userId) {
            emit({
              type: "user.signedIn",
              payload: { userId, ...traits },
            });

            monitoring.identifyUser({ id: userId, ...traits });
          }

          break;

        case "USER_UPDATED":
          if (userId) {
            emit({
              type: "user.updated",
              payload: { userId, ...traits },
            });
          }

          break;

        default:
          // No action needed for other event types
          break;
      }
    },
    [emit, monitoring]
  );
}
