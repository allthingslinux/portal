import { useEffect } from "react";

import type { Notification } from "~/features/notifications/types";

export function useNotificationsStream({
  onNotifications: _onNotifications,
  accountIds: _accountIds,
  enabled: _enabled,
}: {
  onNotifications: (notifications: Notification[]) => void;
  accountIds: string[];
  enabled: boolean;
}) {
  useEffect(() => {
    return;
  }, []);
}
