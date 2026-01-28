import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading UI for the root segment.
 * Shown during RSC resolution for the home page (e.g. while getTranslations resolves).
 */
export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="space-y-4 text-center">
        <Skeleton className="mx-auto h-10 w-72" />
        <Skeleton className="mx-auto h-6 w-96" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
