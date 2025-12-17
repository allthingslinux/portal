import { AppLogo } from "~/components/app-logo";
import {
  BorderedNavigationMenu,
  BorderedNavigationMenuItem,
} from "~/components/makerkit/bordered-navigation-menu";
import { ProfileAccountDropdownContainer } from "~/components/personal-account-dropdown-container";
import { getTeamAccountSidebarConfig } from "~/config/team-account-navigation.config";
import { TeamAccountAccountsSelector } from "~/home/[account]/_components/team-account-accounts-selector";

// local imports
import type { TeamAccountWorkspace } from "../_lib/server/team-account-workspace.loader";
import { TeamAccountNotifications } from "./team-account-notifications";

export function TeamAccountNavigationMenu(props: {
  workspace: TeamAccountWorkspace;
}) {
  const { account, user, accounts } = props.workspace;

  const routes = getTeamAccountSidebarConfig(account.slug ?? "").routes.reduce<
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

      <div className={"flex items-center justify-end space-x-2.5"}>
        <TeamAccountNotifications accountId={account.id} userId={user.id} />

        <TeamAccountAccountsSelector
          accounts={accounts.map((accountItem) => ({
            label: accountItem.name,
            value: accountItem.slug,
            image: accountItem.picture_url,
          }))}
          selectedAccount={account.slug ?? ""}
          userId={user.id}
        />

        <div>
          <ProfileAccountDropdownContainer
            showProfileName={false}
            user={user}
          />
        </div>
      </div>
    </div>
  );
}
