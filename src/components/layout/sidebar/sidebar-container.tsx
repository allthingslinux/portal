"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNavigation } from "./sidebar-navigation";
import { SidebarUserSection } from "./sidebar-user-section";
import { useTranslatedRoutes } from "@/features/routing/hooks/use-translated-routes";
import {
  getFooterActions,
  getNavigationItems,
} from "@/features/routing/lib/permissions";
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
  // Get translated route config (automatically resolves translations from locale file)
  const translatedConfig = useTranslatedRoutes();

  const permissions = {
    canViewAdmin: canViewAdmin ?? clientPermissions.canViewAdmin,
  };

  const navigationGroups = getNavigationItems(translatedConfig, permissions);
  const footerActions = getFooterActions(translatedConfig, permissions);

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
