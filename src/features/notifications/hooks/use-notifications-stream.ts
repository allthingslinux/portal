import { useEffect } from "react";

import type { Notification } from "../types";

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
    // Realtime notifications disabled; no-op stream.
    // No dependencies needed since this is a no-op
    return;
  }, []);
}
