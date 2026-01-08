"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ProtectedRoute } from "@/lib/routes/types";
import { SidebarMenuButton, SidebarMenuItem } from "@/ui/sidebar";

interface NavItemProps {
  route: ProtectedRoute;
}

export function NavItem({ route }: NavItemProps) {
  const pathname = usePathname();

  // Check if breadcrumb config specifies exact matching
  const isExact = route.breadcrumb?.exact === true;

  // If route has children, only be active if pathname exactly matches
  // (children will be handled by NavCollapsible)
  const hasChildren =
    route.navigation?.children && route.navigation.children.length > 0;

  let isActive: boolean;
  if (isExact || hasChildren) {
    // For exact routes or routes with children, only match exactly
    isActive = pathname === route.path;
  } else {
    // For routes without exact flag and no children, match pathname or paths that start with it
    isActive = pathname === route.path || pathname.startsWith(`${route.path}/`);
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={route.label}>
        <Link href={route.path as Parameters<typeof Link>[0]["href"]}>
          {route.icon && <route.icon />}
          <span>{route.label}</span>
          {route.navigation?.badge && (
            <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs">
              {route.navigation.badge}
            </span>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
