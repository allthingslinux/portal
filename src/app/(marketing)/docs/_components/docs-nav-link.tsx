"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, isRouteActive } from "~/components/lib/utils";
import { SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar";

export function DocsNavLink({
  label,
  url,
  children,
}: React.PropsWithChildren<{ label: string; url: string }>) {
  const currentPath = usePathname();
  const isCurrent = isRouteActive(url, currentPath, true);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn("text-secondary-foreground transition-all")}
        isActive={isCurrent}
      >
        <Link href={url}>
          <span className="block max-w-full truncate">{label}</span>

          {children}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
