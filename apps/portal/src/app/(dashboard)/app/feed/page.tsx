import type { Metadata } from "next";
import { getRouteMetadata } from "@portal/seo/metadata";
import { PageContent, PageHeader } from "@portal/ui/layout/page";

import { verifySession } from "@/auth/dal";
import { FeedContent } from "./feed-content";
import { LINUX_FEED_SOURCES } from "@/config/feed";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { fetchAllLinuxFeeds } from "@/shared/feed";

export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app/feed", routeConfig, resolver);
}

export default async function FeedPage() {
  await verifySession();

  const resolver = await getServerRouteResolver();
  const { articles, results } = await fetchAllLinuxFeeds(LINUX_FEED_SOURCES);

  // Strip non-serializable fields (RegExp) before passing to the Client Component
  const sources = LINUX_FEED_SOURCES.map(
    ({ categoryPattern: _, ...rest }) => rest
  );

  return (
    <PageContent>
      <PageHeader pathname="/app/feed" resolver={resolver} />
      <FeedContent articles={articles} results={results} sources={sources} />
    </PageContent>
  );
}
