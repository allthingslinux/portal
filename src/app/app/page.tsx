import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppHeader } from "@/components/layout/app-header";
import { auth } from "@/auth";

export default async function AppPage() {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: "App", href: "/app" }, { label: "Overview" }]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>
              Welcome back, {session.user.name || session.user.email}!
            </CardTitle>
            <CardDescription>
              Here's your dashboard overview. Use the sidebar to navigate to
              account settings.
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
}
