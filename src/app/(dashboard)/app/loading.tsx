import { Skeleton } from "@/components/ui/skeleton";
import { PageContent } from "@/components/layout/page";

/**
 * Loading UI for the dashboard segment.
 * Shown during RSC resolution for /app routes (overview, admin, settings, integrations).
 * Matches the layout structure of dashboard pages for a consistent transition.
 */
export default function DashboardLoading() {
  return (
    <PageContent>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </PageContent>
  );
}
