"use client";

import { NavGroup } from "../navigation/nav-group";
import type {
  NavigationGroup,
  ProtectedRoute,
} from "@/features/routing/lib/types";

interface SidebarNavigationProps {
  groups: (NavigationGroup & { items: ProtectedRoute[] })[];
}

export function SidebarNavigation({ groups }: SidebarNavigationProps) {
  return (
    <>
      {groups.map((group) => (
        <NavGroup group={group} key={group.id} />
      ))}
    </>
  );
}
