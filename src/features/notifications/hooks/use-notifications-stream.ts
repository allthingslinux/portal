import { useEffect } from "react";

import { useSupabase } from "~/core/database/supabase/hooks/use-supabase";

import type { Notification } from "../types";

export function useNotificationsStream({
  onNotifications,
  accountIds,
  enabled,
}: {
  onNotifications: (notifications: Notification[]) => void;
  accountIds: string[];
  enabled: boolean;
}) {
  const client = useSupabase();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const channel = client.channel("notifications-channel");

    const subscription = channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          filter: `account_id=in.(${accountIds.join(", ")})`,
          table: "notifications",
        },
        (payload) => {
          onNotifications([payload.new as Notification]);
        }
      )
      .subscribe();

    return () => {
      subscription?.unsubscribe();
    };
  }, [client, onNotifications, accountIds, enabled]);
}
