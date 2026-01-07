// ============================================================================
// Page Header Component
// ============================================================================
// Standardized page header component for consistent styling across dashboard pages.
// Provides a consistent header with title and description.

import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

interface PageHeaderProps {
  title: ReactNode;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="font-semibold text-2xl">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-96" />
    </div>
  );
}
