import featuresFlagConfig from "~/config/feature-flags.config";
import { NotificationsPopover } from "~/features/notifications/components/notifications-popover";

export function UserNotifications(props: { userId: string }) {
  if (!featuresFlagConfig.enableNotifications) {
    return null;
  }

  return (
    <NotificationsPopover
      accountIds={[props.userId]}
      realtime={featuresFlagConfig.realtimeNotifications}
    />
  );
}
