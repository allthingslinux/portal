import { AppLogo } from "~/components/app-logo";
import { ProfileAccountDropdownContainer } from "~/components/personal-account-dropdown-container";
import {
  BorderedNavigationMenu,
  BorderedNavigationMenuItem,
} from "~/components/portal/bordered-navigation-menu";
import { If } from "~/components/portal/if";
import featuresFlagConfig from "~/config/feature-flags.config";
import { personalAccountNavigationConfig } from "~/config/personal-account-navigation.config";

// home imports
import { HomeAccountSelector } from "../_components/home-account-selector";
import { UserNotifications } from "../_components/user-notifications";
import type { UserWorkspace } from "../_lib/server/load-user-workspace";

export function HomeMenuNavigation(props: { workspace: UserWorkspace }) {
  const { workspace, user, accounts } = props.workspace;
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

        <If condition={featuresFlagConfig.enableTeamAccounts}>
          <HomeAccountSelector accounts={accounts} userId={user.id} />
        </If>

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
