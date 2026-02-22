import { BookOpen, Calendar, DollarSign, GitBranch } from "lucide-react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";

import { PageContent, PageHeader } from "@/components/layout/page";
import { verifySession } from "@/auth/dal";
import { LatestUpdatesCard } from "@/features/blog/components/latest-updates-card";
import { DiscordMemberStat } from "@/features/integrations/components/discord-member-stat";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { RecentWikiChangesCard } from "@/features/wiki/components/recent-wiki-changes-card";
import { getServerQueryClient } from "@/shared/api/hydration";
import { queryKeys } from "@/shared/api/query-keys";
import { fetchCurrentUserServer } from "@/shared/api/server-queries";
import { getRouteMetadata } from "@/shared/seo";

export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app", routeConfig, resolver);
}

const MOCK_QUICK_LINKS = [
  { label: "atl.dev", href: "https://atl.dev" },
  { label: "atl.chat", href: "https://atl.chat" },
  { label: "Wiki", href: "https://wiki.atl.dev" },
  { label: "GitHub", href: "https://github.com/allthingslinux" },
];

// Placeholder stat cards — wire to real APIs when available
function StatCard({
  title,
  value,
  subtitle,
  Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
      <div className="flex items-center gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
        <span className="font-medium text-muted-foreground text-sm">
          {title}
        </span>
      </div>
      <div className="mt-3">
        <div className="font-bold text-2xl text-foreground tabular-nums">
          {value}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-muted-foreground text-xs">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default async function AppPage() {
  const sessionData = await verifySession();
  const queryClient = getServerQueryClient();

  const [user, resolver, t] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: queryKeys.users.current(),
      queryFn: () => fetchCurrentUserServer(sessionData.session),
    }),
    getServerRouteResolver(),
    getTranslations(),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageContent>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            description={t("routes.dashboard.ui.description")}
            pathname="/app"
            resolver={resolver}
            title={t("routes.dashboard.ui.title", {
              name: user.name || user.email,
            })}
          />
          {/* Account info — top right */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-4 py-2.5 dark:border-border/40 dark:bg-card/30">
              <div className="size-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground text-sm">
                Identity active
              </span>
            </div>
            {user.createdAt && (
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-primary/10 px-4 py-2.5 dark:bg-primary/20">
                <Calendar className="size-4 text-primary" />
                <span className="text-sm">
                  Member since{" "}
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Stats row — 4 cards */}
          <section>
            <h2 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wider">
              Community stats
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DiscordMemberStat />
              <StatCard
                Icon={BookOpen}
                subtitle="+8 new this week"
                title="Wiki pages"
                value="301"
              />
              <StatCard
                Icon={GitBranch}
                subtitle="Last updated 2 hours ago"
                title="Git commits"
                value="420"
              />
              <StatCard
                Icon={DollarSign}
                subtitle="This month"
                title="Donations"
                value="$1,337"
              />
            </div>
          </section>

          {/* Two-column: Latest Blog Posts | Recent Wiki Changes */}
          <section className="grid gap-6 lg:grid-cols-2">
            <LatestUpdatesCard />
            <RecentWikiChangesCard />
          </section>

          {/* Quick links — compact strip */}
          <section>
            <h2 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wider">
              Quick links
            </h2>
            <div className="flex flex-wrap gap-2">
              {MOCK_QUICK_LINKS.map((link) => (
                <a
                  className="rounded-lg border border-border/60 bg-card/50 px-4 py-2.5 text-sm transition-colors hover:bg-card dark:border-border/40 dark:bg-card/30 dark:hover:bg-card"
                  href={link.href}
                  key={link.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        </div>
      </PageContent>
    </HydrationBoundary>
  );
}
