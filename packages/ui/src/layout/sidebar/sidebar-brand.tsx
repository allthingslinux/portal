"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar";
import { APP_NAME } from "@/shared/config/app";

export function SidebarBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={(props) => (
            <Link {...props} className={`${props.className} gap-2`} href="/app">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <LayoutDashboard className="size-4" />
              </div>
              <span className="truncate font-semibold">{APP_NAME}</span>
            </Link>
          )}
          size="lg"
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
