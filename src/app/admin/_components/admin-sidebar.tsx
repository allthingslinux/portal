"use client";

import { LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "~/components/app-logo";
import { ProfileAccountDropdownContainer } from "~/components/personal-account-dropdown-container";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "~/components/ui/sidebar";

export function AdminSidebar() {
  const path = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={"m-2"}>
        <AppLogo className="max-w-full" href={"/admin"} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Super Admin</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuButton asChild isActive={path === "/admin"}>
                <Link className={"flex gap-2.5"} href={"/admin"}>
                  <LayoutDashboard className={"h-4"} />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>

              <SidebarMenuButton
                asChild
                isActive={path.includes("/admin/accounts")}
              >
                <Link
                  className={"flex size-full gap-2.5"}
                  href={"/admin/accounts"}
                >
                  <Users className={"h-4"} />
                  <span>Accounts</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <ProfileAccountDropdownContainer />
      </SidebarFooter>
    </Sidebar>
  );
}
