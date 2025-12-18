import { cookies } from "next/headers";
import { use } from "react";

import { z } from "zod";
import { AppLogo } from "~/components/app-logo";
import {
  Page,
  PageMobileNavigation,
  PageNavigation,
} from "~/components/portal/page";
import { SidebarProvider } from "~/components/ui/sidebar";
import { getTeamAccountSidebarConfig } from "~/config/team-account-navigation.config";
import { TeamAccountWorkspaceContextProvider } from "~/features/team-accounts/components/team-account-workspace-context";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

import { TeamAccountLayoutMobileNavigation } from "./_components/team-account-layout-mobile-navigation";
import { TeamAccountLayoutSidebar } from "./_components/team-account-layout-sidebar";
import { TeamAccountNavigationMenu } from "./_components/team-account-navigation-menu";
import { loadTeamWorkspace } from "./_lib/server/team-account-workspace.loader";

type TeamWorkspaceLayoutProps = React.PropsWithChildren<{
  params: Promise<{ account: string }>;
}>;

function TeamWorkspaceLayout({ children, params }: TeamWorkspaceLayoutProps) {
  const account = use(params).account;
  const state = use(getLayoutState(account));

  if (state.style === "sidebar") {
    return <SidebarLayout account={account}>{children}</SidebarLayout>;
  }

  return <HeaderLayout account={account}>{children}</HeaderLayout>;
}

function SidebarLayout({
  account,
  children,
}: React.PropsWithChildren<{
  account: string;
}>) {
  const data = use(loadTeamWorkspace(account));
  const permissions = data.account.permissions.filter(
    (
      p
    ): p is
      | "roles.manage"
      | "settings.manage"
      | "members.manage"
      | "invites.manage" =>
      [
        "roles.manage",
        "settings.manage",
        "members.manage",
        "invites.manage",
      ].includes(p as string)
  );
  const workspaceValue = {
    ...data,
    account: {
      ...data.account,
      permissions,
      pictureUrl: data.account.pictureUrl ?? "",
      slug: data.account.slug ?? "",
    },
    accounts: data.accounts.map((acc) => ({
      ...acc,
      pictureUrl: acc.pictureUrl ?? "",
      slug: acc.slug ?? "",
    })),
  };
  const state = use(getLayoutState(account));

  const accountsForSelector = data.accounts.map((acc) => ({
    label: acc.name,
    value: acc.slug,
    image: acc.pictureUrl,
  }));

  return (
    <TeamAccountWorkspaceContextProvider value={workspaceValue}>
      <SidebarProvider defaultOpen={state.open}>
        <Page style={"sidebar"}>
          <PageNavigation>
            <TeamAccountLayoutSidebar
              account={account}
              accountId={data.account.id}
              accounts={accountsForSelector}
              user={data.user}
            />
          </PageNavigation>

          <PageMobileNavigation className={"flex items-center justify-between"}>
            <AppLogo />

            <div className={"flex space-x-4"}>
              <TeamAccountLayoutMobileNavigation
                account={account}
                accounts={accountsForSelector}
                userId={data.user.id}
              />
            </div>
          </PageMobileNavigation>

          {children}
        </Page>
      </SidebarProvider>
    </TeamAccountWorkspaceContextProvider>
  );
}

function HeaderLayout({
  account,
  children,
}: React.PropsWithChildren<{
  account: string;
}>) {
  const data = use(loadTeamWorkspace(account));
  const permissions = data.account.permissions.filter(
    (
      p
    ): p is
      | "roles.manage"
      | "settings.manage"
      | "members.manage"
      | "invites.manage" =>
      [
        "roles.manage",
        "settings.manage",
        "members.manage",
        "invites.manage",
      ].includes(p as string)
  );
  const workspaceValue = {
    ...data,
    account: {
      ...data.account,
      permissions,
      pictureUrl: data.account.pictureUrl ?? "",
      slug: data.account.slug ?? "",
    },
    accounts: data.accounts.map((acc) => ({
      ...acc,
      pictureUrl: acc.pictureUrl ?? "",
      slug: acc.slug ?? "",
    })),
  };

  const accountsForSelector = data.accounts.map((acc) => ({
    label: acc.name,
    value: acc.slug,
    image: acc.pictureUrl,
  }));

  return (
    <TeamAccountWorkspaceContextProvider value={workspaceValue}>
      <Page style={"header"}>
        <PageNavigation>
          <TeamAccountNavigationMenu workspace={workspaceValue} />
        </PageNavigation>

        <PageMobileNavigation className={"flex items-center justify-between"}>
          <AppLogo />

          <div className={"group-data-[mobile:hidden]"}>
            <TeamAccountLayoutMobileNavigation
              account={account}
              accounts={accountsForSelector}
              userId={data.user.id}
            />
          </div>
        </PageMobileNavigation>

        {children}
      </Page>
    </TeamAccountWorkspaceContextProvider>
  );
}

async function getLayoutState(account: string) {
  const cookieStore = await cookies();
  const config = getTeamAccountSidebarConfig(account);

  const LayoutStyleSchema = z
    .enum(["sidebar", "header", "custom"])
    .default(config.style);

  const sidebarOpenCookie = cookieStore.get("sidebar:state");
  const layoutCookie = cookieStore.get("layout-style");

  const layoutStyle = LayoutStyleSchema.safeParse(layoutCookie?.value);

  const sidebarOpenCookieValue = sidebarOpenCookie
    ? sidebarOpenCookie.value === "false"
    : !config.sidebarCollapsed;

  const style = layoutStyle.success ? layoutStyle.data : config.style;

  return {
    open: sidebarOpenCookieValue,
    style,
  };
}

export default withI18n(TeamWorkspaceLayout);
