import { AppLogo } from "~/components/app-logo";
import { cn } from "~/components/lib/utils";
import { ProfileAccountDropdownContainer } from "~/components/personal-account-dropdown-container";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
} from "~/components/ui/sidebar";
import { personalAccountNavigationConfig } from "~/lib/config/personal-account-navigation.config";
import type { UserWorkspace } from "../_lib/server/load-user-workspace";

import { UserNotifications } from "./user-notifications";

type HomeSidebarProps = {
  workspace: UserWorkspace;
};

export function HomeSidebar(props: HomeSidebarProps) {
  const { workspace, user } = props.workspace;
  const personalAccount = workspace ?? undefined;
  const collapsible = personalAccountNavigationConfig.sidebarCollapsedStyle;

  return (
    <Sidebar collapsible={collapsible}>
      <SidebarHeader className={"h-16 justify-center"}>
        <div className={"flex items-center justify-between gap-x-3"}>
          <AppLogo
            className={cn(
              "p-2 group-data-[minimized=true]/sidebar:max-w-full group-data-[minimized=true]/sidebar:py-0"
            )}
          />

          <div className={"group-data-[minimized=true]/sidebar:hidden"}>
            <UserNotifications userId={user.id} />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation config={personalAccountNavigationConfig} />
      </SidebarContent>

      <SidebarFooter className={"flex flex-col gap-2"}>
        <ProfileAccountDropdownContainer
          account={personalAccount}
          user={user}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
