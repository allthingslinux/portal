import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading UI for the dashboard segment.
 * Shown during RSC resolution for /app routes (overview, admin, settings, integrations).
 * Matches the layout structure of dashboard pages for a consistent transition.
 */
export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
