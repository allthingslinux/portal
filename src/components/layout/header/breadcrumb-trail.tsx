"use client";

import type { BreadcrumbItem as BreadcrumbItemType } from "@/types/routes";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb";

interface BreadcrumbTrailProps {
  items: BreadcrumbItemType[];
}

export function BreadcrumbTrail({ items }: BreadcrumbTrailProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((crumb, index) => (
          <div className="flex items-center" key={`${crumb.label}-${index}`}>
            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {crumb.href ? (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
