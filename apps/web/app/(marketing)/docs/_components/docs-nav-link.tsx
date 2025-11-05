'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SidebarMenuButton, SidebarMenuItem } from '@portal/ui/shadcn-sidebar';
import { cn, isRouteActive } from '@portal/ui/utils';

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
        isActive={isCurrent}
        className={cn('text-secondary-foreground transition-all')}
      >
        <Link href={url}>
          <span className="block max-w-full truncate">{label}</span>

          {children}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
