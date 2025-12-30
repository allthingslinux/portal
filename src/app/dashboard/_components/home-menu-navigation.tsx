import { AppLogo } from "~/components/app-logo";
import {
  BorderedNavigationMenu,
  BorderedNavigationMenuItem,
} from "~/components/bordered-navigation-menu";
import { ProfileAccountDropdownContainer } from "~/components/personal-account-dropdown-container";
import { personalAccountNavigationConfig } from "~/lib/config/personal-account-navigation.config";

import { UserNotifications } from "../_components/user-notifications";
import type { UserWorkspace } from "../_lib/server/load-user-workspace";

export function HomeMenuNavigation(props: { workspace: UserWorkspace }) {
  const { workspace, user } = props.workspace;
  const personalAccount = workspace ?? undefined;

  const routes = personalAccountNavigationConfig.routes.reduce<
    Array<{
      path: string;
      label: string;
      Icon?: React.ReactNode;
      end?: boolean | ((path: string) => boolean);
    }>
  >((acc, item) => {
    if ("children" in item) {
      acc.push(...item.children);
      return acc;
    }

    if ("divider" in item) {
      return acc;
    }

    acc.push(item);
    return acc;
  }, []);

  return (
    <div className={"flex w-full flex-1 justify-between"}>
      <div className={"flex items-center space-x-8"}>
        <AppLogo />

        <BorderedNavigationMenu>
          {routes.map((route) => (
            <BorderedNavigationMenuItem {...route} key={route.path} />
          ))}
        </BorderedNavigationMenu>
      </div>

      <div className={"flex justify-end space-x-2.5"}>
        <UserNotifications userId={user.id} />

        <div>
          <ProfileAccountDropdownContainer
            account={personalAccount}
            showProfileName={false}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}
