"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { usePermissions } from "@/hooks/use-permissions";
import { useTranslatedRoutes } from "@/features/routing/hooks/use-translated-routes";
import { createRouteTranslationResolver } from "@/features/routing/lib/i18n";
import { getNavigationItems } from "@/features/routing/lib/permissions";

/**
 * Global command menu component (Cmd+K / Ctrl+K)
 * Provides quick navigation to all accessible routes
 */
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const translatedConfig = useTranslatedRoutes();
  const permissions = usePermissions();
  const t = useTranslations();
  const resolver = createRouteTranslationResolver(t);

  // Get navigation items filtered by permissions
  const navigationGroups = getNavigationItems(
    translatedConfig,
    permissions,
    resolver
  );

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Cmd+K on Mac, Ctrl+K on Windows/Linux
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    router.push(path as Parameters<typeof router.push>[0]);
  };

  return (
    <CommandDialog onOpenChange={setOpen} open={open}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.id}>
            <CommandGroup heading={group.label || "Navigation"}>
              {group.items.map((route) => {
                const Icon = route.icon;
                return (
                  <div key={route.id}>
                    <CommandItem
                      onSelect={() => handleSelect(route.path)}
                      value={`${route.label || route.id} ${route.path}`}
                    >
                      {Icon && <Icon />}
                      <span>{route.label || route.id}</span>
                    </CommandItem>
                    {/* Render child routes */}
                    {route.navigation?.children?.map((child) => {
                      const childLabel = child.label || route.label || child.id;
                      return (
                        <CommandItem
                          className="pl-8"
                          key={child.id}
                          onSelect={() => handleSelect(child.path)}
                          value={`${childLabel} ${child.path}`}
                        >
                          <span>{childLabel}</span>
                        </CommandItem>
                      );
                    })}
                  </div>
                );
              })}
            </CommandGroup>
            {groupIndex < navigationGroups.length - 1 && <CommandSeparator />}
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
