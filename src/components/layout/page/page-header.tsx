import type { ReactNode } from "react";

import type { RouteTranslationResolver } from "@/features/routing/lib";
import { getUIDisplay, routeConfig } from "@/features/routing/lib";

interface PageHeaderProps {
  title?: ReactNode;
  description?: string;
  pathname?: string;
  resolver?: RouteTranslationResolver;
}

export function PageHeader({
  title,
  description,
  pathname,
  resolver,
}: PageHeaderProps) {
  // Get UI display values (with fallback to metadata)
  // If resolver provided, translations will be automatically resolved
  const { title: uiTitle, description: uiDescription } = pathname
    ? getUIDisplay(pathname, routeConfig, resolver)
    : { title: undefined, description: undefined };

  // Use provided props, then UI display, then fallback to undefined
  const displayTitle = title ?? uiTitle;
  const displayDescription = description ?? uiDescription;

  return (
    <div className="space-y-2">
      {displayTitle && (
        <h1 className="font-semibold text-2xl">{displayTitle}</h1>
      )}
      {displayDescription && (
        <p className="text-muted-foreground">{displayDescription}</p>
      )}
    </div>
  );
}
