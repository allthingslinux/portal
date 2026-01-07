"use client";

import type { NavigationGroup, ProtectedRoute } from "@/lib/navigation/types";
import { NavCollapsible } from "./nav-collapsible";
import { NavItem } from "./nav-item";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/ui/sidebar";

interface NavGroupProps {
  group: NavigationGroup & { items: ProtectedRoute[] };
}

export function NavGroup({ group }: NavGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
      <SidebarMenu>
        {group.items.map((item) =>
          item.navigation?.children ? (
            <NavCollapsible key={item.id} route={item} />
          ) : (
            <NavItem key={item.id} route={item} />
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
