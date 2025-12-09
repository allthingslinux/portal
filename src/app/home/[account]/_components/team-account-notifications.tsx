import featuresFlagConfig from "~/config/feature-flags.config";
import { NotificationsPopover } from "~/features/notifications/components";

export function TeamAccountNotifications(params: {
  userId: string;
  accountId: string;
}) {
  if (!featuresFlagConfig.enableNotifications) {
    return null;
  }

  return (
    <NotificationsPopover
      accountIds={[params.userId, params.accountId]}
      realtime={featuresFlagConfig.realtimeNotifications}
    />
  );
}
