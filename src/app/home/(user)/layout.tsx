import { cookies } from "next/headers";
import { use } from "react";

import { z } from "zod";
import { AppLogo } from "~/components/app-logo";
import {
  Page,
  PageMobileNavigation,
  PageNavigation,
} from "~/components/makerkit/page";
import { SidebarProvider } from "~/components/ui/sidebar";
import { personalAccountNavigationConfig } from "~/config/personal-account-navigation.config";
import { UserWorkspaceContextProvider } from "~/features/accounts/components";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

// home imports
import { HomeMenuNavigation } from "./_components/home-menu-navigation";
import { HomeMobileNavigation } from "./_components/home-mobile-navigation";
import { HomeSidebar } from "./_components/home-sidebar";
import { loadUserWorkspace } from "./_lib/server/load-user-workspace";

function UserHomeLayout({ children }: React.PropsWithChildren) {
  const state = use(getLayoutState());

  if (state.style === "sidebar") {
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  return <HeaderLayout>{children}</HeaderLayout>;
}

export default withI18n(UserHomeLayout);

function SidebarLayout({ children }: React.PropsWithChildren) {
  const workspace = use(loadUserWorkspace());
  const state = use(getLayoutState());

  return (
    <UserWorkspaceContextProvider value={workspace}>
      <SidebarProvider defaultOpen={state.open}>
        <Page style={"sidebar"}>
          <PageNavigation>
            <HomeSidebar workspace={workspace} />
          </PageNavigation>

          <PageMobileNavigation className={"flex items-center justify-between"}>
            <MobileNavigation workspace={workspace} />
          </PageMobileNavigation>

          {children}
        </Page>
      </SidebarProvider>
    </UserWorkspaceContextProvider>
  );
}

function HeaderLayout({ children }: React.PropsWithChildren) {
  const workspace = use(loadUserWorkspace());

  return (
    <UserWorkspaceContextProvider value={workspace}>
      <Page style={"header"}>
        <PageNavigation>
          <HomeMenuNavigation workspace={workspace} />
        </PageNavigation>

        <PageMobileNavigation className={"flex items-center justify-between"}>
          <MobileNavigation workspace={workspace} />
        </PageMobileNavigation>

        {children}
      </Page>
    </UserWorkspaceContextProvider>
  );
}

function MobileNavigation({
  workspace,
}: {
  workspace: Awaited<ReturnType<typeof loadUserWorkspace>>;
}) {
  return (
    <>
      <AppLogo />

      <HomeMobileNavigation workspace={workspace} />
    </>
  );
}

async function getLayoutState() {
  const cookieStore = await cookies();

  const LayoutStyleSchema = z.enum(["sidebar", "header", "custom"]);

  const layoutStyleCookie = cookieStore.get("layout-style");
  const sidebarOpenCookie = cookieStore.get("sidebar:state");

  const sidebarOpen = sidebarOpenCookie
    ? sidebarOpenCookie.value === "false"
    : !personalAccountNavigationConfig.sidebarCollapsed;

  const parsedStyle = LayoutStyleSchema.safeParse(layoutStyleCookie?.value);

  const style = parsedStyle.success
    ? parsedStyle.data
    : personalAccountNavigationConfig.style;

  return {
    open: sidebarOpen,
    style,
  };
}
