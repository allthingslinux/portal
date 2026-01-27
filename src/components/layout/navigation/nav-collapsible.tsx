"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ProtectedRoute } from "@/features/routing/lib/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/ui/sidebar";

interface NavCollapsibleProps {
  route: ProtectedRoute;
}

export function NavCollapsible({ route }: NavCollapsibleProps) {
  const pathname = usePathname();
  const children = route.navigation?.children || [];

  // Check if any child is active
  const isActive = children.some(
    (child) => pathname === child.path || pathname.startsWith(`${child.path}/`)
  );

  // Check if current route is active
  const isRouteActive =
    pathname === route.path || pathname.startsWith(`${route.path}/`);

  return (
    <Collapsible
      asChild
      className="group/collapsible"
      defaultOpen={isActive || isRouteActive}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isActive || isRouteActive}
            tooltip={route.label}
          >
            {route.icon && <route.icon />}
            <span>{route.label}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {children.map((child) => (
              <SidebarMenuSubItem key={child.id}>
                <SidebarMenuSubButton asChild>
                  <Link href={child.path as Parameters<typeof Link>[0]["href"]}>
                    <span>{child.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
