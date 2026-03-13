"use client";

import { UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@portal/ui/layout/page/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@portal/ui/ui/card";

import { AdminStats } from "./admin-stats";
import { useTranslatedRoutes } from "@/features/routing/hooks/use-translated-routes";

const QUICK_LINKS = [
  {
    href: "/app/admin/users",
    label: "Users",
    description: "Manage users and integration accounts",
    icon: Users,
  },
  {
    href: "/app/admin/sessions",
    label: "Sessions",
    description: "View and manage active user sessions",
    icon: UserCheck,
  },
] as const;

export function AdminDashboardOverview() {
  const translatedConfig = useTranslatedRoutes();

  const route = [
    ...translatedConfig.public,
    ...translatedConfig.protected,
  ].find((r) => r.path === "/app/admin");

  const title = route?.ui?.title ?? route?.metadata.title;
  const description = route?.ui?.description ?? route?.metadata.description;

  return (
    <div className="space-y-6">
      <PageHeader
        description={description}
        pathname="/app/admin"
        title={title}
      />

      <AdminStats />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link href={link.href} key={link.href}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">
                    {link.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
