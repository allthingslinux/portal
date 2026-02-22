"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { BreadcrumbTrail } from "./breadcrumb-trail";
import { ThemeToggle } from "./theme-toggle";
import {
  createRouteTranslationResolver,
  generateBreadcrumbs,
  routeConfig,
} from "@/features/routing/lib";
import { Separator } from "@/ui/separator";
import { SidebarTrigger } from "@/ui/sidebar";

export function AppHeader() {
  const pathname = usePathname();
  const t = useTranslations();
  const resolver = createRouteTranslationResolver(t);
  const breadcrumbs = generateBreadcrumbs(pathname, routeConfig, resolver);

  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-border border-b bg-sidebar px-3 text-sidebar-foreground transition-[width] ease-linear lg:border-b lg:px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="flex h-full items-center">
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-0.5"
            orientation="vertical"
          />
        </div>
        <BreadcrumbTrail items={breadcrumbs} />
      </div>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
