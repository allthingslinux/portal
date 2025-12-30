import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import type { Notification } from "~/features/notifications/types";
import { useNotificationsStream } from "./use-notifications-stream";

export function useFetchNotifications({
  onNotifications,
  accountIds,
  realtime,
}: {
  onNotifications: (notifications: Notification[]) => unknown;
  accountIds: string[];
  realtime: boolean;
}) {
  const { data: initialNotifications } = useFetchInitialNotifications({
    accountIds,
  });

  useNotificationsStream({
    onNotifications,
    accountIds,
    enabled: realtime,
  });

  useEffect(() => {
    if (initialNotifications) {
      onNotifications(initialNotifications);
    }
  }, [initialNotifications, onNotifications]);
}

import { fetchNotificationsAction } from "~/features/accounts/server/notifications-server-actions";

function useFetchInitialNotifications(props: { accountIds: string[] }) {
  return useQuery({
    queryKey: ["notifications", ...props.accountIds],
    queryFn: async () => await fetchNotificationsAction(props.accountIds),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
