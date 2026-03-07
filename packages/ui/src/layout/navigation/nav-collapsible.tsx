"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../../ui/sidebar";
import type { ProtectedRoute } from "@/features/routing/lib/types";

interface NavCollapsibleProps {
  route: ProtectedRoute;
}

export function NavCollapsible({ route }: NavCollapsibleProps) {
  const pathname = usePathname();
  const children = route.navigation?.children || [];

  const isActive = children.some(
    (child) => pathname === child.path || pathname.startsWith(`${child.path}/`)
  );

  const isRouteActive =
    pathname === route.path || pathname.startsWith(`${route.path}/`);

  const Icon = route.icon;

  return (
    <Collapsible
      defaultOpen={isActive || isRouteActive}
      render={<SidebarMenuItem className="group/collapsible" />}
    >
      <CollapsibleTrigger
        render={(triggerProps) => (
          <SidebarMenuButton
            {...triggerProps}
            isActive={isActive || isRouteActive}
            tooltip={route.label}
          >
            {Icon && <Icon />}
            <span>{route.label}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        )}
      />
      <CollapsibleContent>
        <SidebarMenuSub>
          {children.map((child) => (
            <SidebarMenuSubItem key={child.id}>
              <SidebarMenuSubButton
                render={(props) => (
                  <Link
                    {...props}
                    href={child.path as Parameters<typeof Link>[0]["href"]}
                  >
                    <span>{child.label}</span>
                  </Link>
                )}
              />
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}
