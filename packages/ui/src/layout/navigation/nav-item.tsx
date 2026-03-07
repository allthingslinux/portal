"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarMenuButton, SidebarMenuItem } from "../../ui/sidebar";
import type { ProtectedRoute } from "@/features/routing/lib/types";

interface NavItemProps {
  route: ProtectedRoute;
}

export function NavItem({ route }: NavItemProps) {
  const pathname = usePathname();

  const isExact = route.breadcrumb?.exact === true;
  const hasChildren =
    route.navigation?.children && route.navigation.children.length > 0;

  const isActive =
    isExact || hasChildren
      ? pathname === route.path
      : pathname === route.path || pathname.startsWith(`${route.path}/`);

  const Icon = route.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        render={(props) => (
          <Link
            {...props}
            href={route.path as Parameters<typeof Link>[0]["href"]}
          >
            {Icon && <Icon />}
            <span>{route.label}</span>
            {route.navigation?.badge && (
              <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs">
                {route.navigation.badge}
              </span>
            )}
          </Link>
        )}
        tooltip={route.label}
      />
    </SidebarMenuItem>
  );
}
