"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { routeConfig } from "@/lib/navigation";
import {
  getFooterActions,
  getNavigationItems,
} from "@/lib/navigation/permissions";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarUserSection } from "./sidebar-user-section";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/ui/sidebar";

interface SidebarContainerProps {
  canViewAdmin?: boolean;
}

export function SidebarContainer({ canViewAdmin }: SidebarContainerProps) {
  const clientPermissions = usePermissions();

  const permissions = {
    canViewAdmin: canViewAdmin ?? clientPermissions.canViewAdmin,
  };

  const navigationGroups = getNavigationItems(routeConfig, permissions);
  const footerActions = getFooterActions(routeConfig, permissions);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation groups={navigationGroups} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserSection actions={footerActions} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
