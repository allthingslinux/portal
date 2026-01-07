import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {/* Brand link skeleton */}
        <div className="flex items-center gap-2 self-center">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Auth form skeleton */}
        <Card>
          <CardHeader className="space-y-2 text-center">
            <Skeleton className="mx-auto h-6 w-48" />
            <Skeleton className="mx-auto h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-center">
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer skeleton */}
        <div className="px-6 text-center">
          <Skeleton className="mx-auto h-3 w-full max-w-xs" />
        </div>
      </div>
    </div>
  );
}
