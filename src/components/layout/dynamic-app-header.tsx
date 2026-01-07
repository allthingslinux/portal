"use client";

// ============================================================================
// Dynamic App Header (Client Component)
// ============================================================================
// Client component that automatically generates breadcrumbs from the current
// route. Pages can optionally override breadcrumbs via the breadcrumbs prop.

import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  type BreadcrumbItem as BreadcrumbItemType,
  generateBreadcrumbsFromPath,
  mergeBreadcrumbs,
} from "@/lib/breadcrumbs";
import { BreadcrumbProvider, useBreadcrumbContext } from "./breadcrumb-context";

interface DynamicAppHeaderProps {
  /**
   * Optional custom breadcrumbs to override auto-generated ones.
   * If provided, they will be merged with auto-generated breadcrumbs.
   */
  breadcrumbs?: BreadcrumbItemType[];
}

// Inner component that uses the breadcrumb context and renders the header
function AppHeaderWithBreadcrumbs({
  breadcrumbs: propBreadcrumbs,
}: DynamicAppHeaderProps) {
  const pathname = usePathname();
  const contextBreadcrumbs = useBreadcrumbContext();

  // Prefer prop breadcrumbs, then context, then auto-generate
  const customBreadcrumbs = propBreadcrumbs ?? contextBreadcrumbs;

  // Auto-generate breadcrumbs from pathname
  const autoBreadcrumbs = generateBreadcrumbsFromPath(pathname);

  // Merge custom breadcrumbs (if any) with auto-generated ones
  const finalBreadcrumbs = mergeBreadcrumbs(autoBreadcrumbs, customBreadcrumbs);

  // Render header with breadcrumbs
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          className="mr-2 data-[orientation=vertical]:h-4"
          orientation="vertical"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {finalBreadcrumbs.map((crumb, index) => (
              <div
                className="flex items-center"
                key={`${crumb.label}-${index}`}
              >
                {index > 0 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
                <BreadcrumbItem
                  className={index === 0 ? "hidden md:block" : ""}
                >
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>
                      {crumb.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto px-4">
        <ThemeToggle />
      </div>
    </header>
  );
}

/**
 * Dynamic App Header component that automatically generates breadcrumbs
 * from the current route. Can be overridden via props or context.
 *
 * Usage:
 *   // Auto-generate from route
 *   <DynamicAppHeader />
 *
 *   // Override with custom breadcrumbs
 *   <DynamicAppHeader breadcrumbs={[{ label: "Custom" }]} />
 */
export function DynamicAppHeader(props: DynamicAppHeaderProps) {
  return (
    <BreadcrumbProvider>
      <AppHeaderWithBreadcrumbs {...props} />
    </BreadcrumbProvider>
  );
}
