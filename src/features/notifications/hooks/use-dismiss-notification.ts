import { useCallback } from "react";

import { dismissNotificationAction } from "~/features/accounts/server/notifications-server-actions";

export function useDismissNotification() {
  return useCallback(async (notificationId: number) => {
    await dismissNotificationAction(notificationId);
  }, []);
}
