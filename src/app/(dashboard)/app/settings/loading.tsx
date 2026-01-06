import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ============================================================================
// Settings Loading Skeleton
// ============================================================================
// Loading skeleton for the settings page that matches the actual page structure.
// This appears immediately when navigating to the settings page, preventing
// flicker while the page loads and Better Auth UI components mount.

function SettingsCardsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        {/* Page header skeleton matching SettingsPage */}
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Tabs skeleton matching SettingsContent structure */}
        <div className="max-w-4xl">
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            </TabsList>

            <TabsContent className="mt-6 space-y-6" value="account">
              <SettingsCardsSkeleton />
            </TabsContent>

            <TabsContent className="mt-6 space-y-6" value="security">
              <SettingsCardsSkeleton />
            </TabsContent>

            <TabsContent className="mt-6 space-y-6" value="api-keys">
              <SettingsCardsSkeleton />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
