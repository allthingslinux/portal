"use client";

import { useCallback, useEffect } from "react";

import { authClient } from "~/core/auth/better-auth";
import { useMonitoring } from "~/core/monitoring/api/hooks";
import { useAppEvents } from "~/shared/events";

export function AuthProvider(props: React.PropsWithChildren) {
  return <AuthEventDispatcher>{props.children}</AuthEventDispatcher>;
}

function AuthEventDispatcher({ children }: React.PropsWithChildren) {
  const { data: session, isPending } = authClient.useSession();
  const dispatchEvent = useDispatchAppEventFromAuthEvent();

  useEffect(() => {
    if (!isPending && session?.user) {
      dispatchEvent("SIGNED_IN", session.user.id, {
        email: session.user.email || "",
      });
    }
  }, [isPending, session, dispatchEvent]);

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
