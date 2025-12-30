import { NotificationsPopover } from "~/components/features/notifications-popover";
import featuresFlagConfig from "~/lib/config/feature-flags.config";

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
