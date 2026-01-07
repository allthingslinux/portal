"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  createRouteTranslationResolver,
  generateBreadcrumbs,
  routeConfig,
} from "@/lib/routes";
import { BreadcrumbTrail } from "./breadcrumb-trail";
import { ThemeToggle } from "./theme-toggle";
import { Separator } from "@/ui/separator";
import { SidebarTrigger } from "@/ui/sidebar";

export function AppHeader() {
  const pathname = usePathname();
  const t = useTranslations();
  const resolver = createRouteTranslationResolver(t);
  const breadcrumbs = generateBreadcrumbs(pathname, routeConfig, resolver);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mr-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <BreadcrumbTrail items={breadcrumbs} />
      </div>
      <div className="ml-auto px-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
