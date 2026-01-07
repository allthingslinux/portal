import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";

export default function AppLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <PageHeader
          description="Here's your dashboard overview. Use the sidebar to navigate to account settings."
          title="Welcome back!"
        />
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Skeleton className="aspect-video rounded-xl" />
          <Skeleton className="aspect-video rounded-xl" />
          <Skeleton className="aspect-video rounded-xl" />
        </div>
        <Skeleton className="min-h-screen flex-1 rounded-xl md:min-h-min" />
      </div>
    </div>
  );
}
