"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

import { APP_NAME } from "@/shared/config/app";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/ui/sidebar";

export function SidebarBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="gap-2"
          render={<Link href="/app" />}
          size="lg"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <LayoutDashboard className="size-4" />
          </div>
          <span className="truncate font-semibold">{APP_NAME}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
