import { Calendar } from "lucide-react";
import type { Metadata } from "next";
import { getServerQueryClient } from "@portal/api/hydration";
import { queryKeys } from "@portal/api/query-keys";
import { fetchCurrentUserServer } from "@portal/api/server-queries";
import { getRouteMetadata } from "@portal/seo/metadata";
import { PageContent, PageHeader } from "@portal/ui/layout/page";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getTranslations } from "next-intl/server";

import { verifySession } from "@/auth/dal";
import { LatestUpdatesCard } from "@/features/blog/components/latest-updates-card";
import { DiscordMemberStat } from "@/features/integrations/components/discord-member-stat";
import { IrcMemberStat } from "@/features/integrations/components/irc-member-stat";
import { XmppMemberStat } from "@/features/integrations/components/xmpp-member-stat";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { RecentWikiChangesCard } from "@/features/wiki/components/recent-wiki-changes-card";

export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app", routeConfig, resolver);
}

const MOCK_QUICK_LINKS = [
  { label: "atl.tools", href: "https://atl.tools" },
  { label: "atl.wiki", href: "https://atl.wiki" },
  { label: "atl.dev", href: "https://atl.dev" },
  { label: "atl.sh", href: "https://atl.sh" },
];

export default async function AppPage() {
  const sessionData = await verifySession();
  const queryClient = getServerQueryClient();

  const [user, resolver, t] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: queryKeys.users.current(),
      queryFn: () =>
        fetchCurrentUserServer(
          sessionData.session as Parameters<typeof fetchCurrentUserServer>[0]
        ),
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <DiscordMemberStat />
              <IrcMemberStat />
              <XmppMemberStat />
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
                  className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 font-medium text-primary text-sm transition-colors hover:border-primary/50 hover:bg-primary/20 dark:border-primary/40 dark:bg-primary/15 dark:hover:bg-primary/25"
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
