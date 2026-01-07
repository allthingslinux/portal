import type { ReactNode } from "react";

import { routeConfig } from "@/lib/navigation";
import { getUIDisplay } from "@/lib/navigation/ui";

interface PageHeaderProps {
  title?: ReactNode;
  description?: string;
  pathname?: string;
}

export function PageHeader({ title, description, pathname }: PageHeaderProps) {
  // Get UI display values (with fallback to metadata)
  const { title: uiTitle, description: uiDescription } = pathname
    ? getUIDisplay(pathname, routeConfig)
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
