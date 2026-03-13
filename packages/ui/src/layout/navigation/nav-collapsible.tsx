"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@portal/utils/utils";

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
      <div className="flex w-full items-center gap-2">
        <SidebarMenuButton
          isActive={isRouteActive || isActive}
          render={(props) => (
            <Link
              {...props}
              className={cn(props.className, "flex flex-1 items-center gap-2")}
              href={route.path as Parameters<typeof Link>[0]["href"]}
            >
              {Icon && <Icon />}
              <span>{route.label}</span>
            </Link>
          )}
          tooltip={route.label}
        />
        <CollapsibleTrigger
          render={(triggerProps) => (
            <button
              type="button"
              {...triggerProps}
              aria-label="Toggle submenu"
              className="shrink-0 rounded-md p-1 outline-hidden hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </button>
          )}
        />
      </div>
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
