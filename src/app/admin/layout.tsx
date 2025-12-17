import type { Metadata } from "next";
import { cookies } from "next/headers";
import { use } from "react";
import { AdminSidebar } from "~/admin/_components/admin-sidebar";
import { AdminMobileNavigation } from "~/admin/_components/mobile-navigation";
import {
  Page,
  PageMobileNavigation,
  PageNavigation,
} from "~/components/makerkit/page";
import { SidebarProvider } from "~/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Super Admin",
};

export const dynamic = "force-dynamic";

export default function AdminLayout(props: React.PropsWithChildren) {
  const state = use(getLayoutState());

  return (
    <SidebarProvider defaultOpen={state.open}>
      <Page style={"sidebar"}>
        <PageNavigation>
          <AdminSidebar />
        </PageNavigation>

        <PageMobileNavigation>
          <AdminMobileNavigation />
        </PageMobileNavigation>

        {props.children}
      </Page>
    </SidebarProvider>
  );
}

async function getLayoutState() {
  const cookieStore = await cookies();
  const sidebarOpenCookie = cookieStore.get("sidebar:state");

  return {
    open: sidebarOpenCookie?.value !== "true",
  };
}
