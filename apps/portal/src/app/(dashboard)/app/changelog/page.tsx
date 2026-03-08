import type { Metadata } from "next";
import { getRouteMetadata } from "@portal/seo/metadata";
import { PageContent, PageHeader } from "@portal/ui/layout/page";

import { verifySession } from "@/auth/dal";
import { ChangelogContent } from "./changelog-content";
import { fetchChangelog } from "@/features/changelog/lib/service";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";
import { CHANGELOG_REPOS } from "@/shared/config/changelog";

export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app/changelog", routeConfig, resolver);
}

export default async function ChangelogPage() {
  await verifySession();

  const resolver = await getServerRouteResolver();
  const { entries, repos, errors } = await fetchChangelog(CHANGELOG_REPOS);

  return (
    <PageContent>
      <PageHeader pathname="/app/changelog" resolver={resolver} />
      <ChangelogContent entries={entries} errors={errors} repos={repos} />
    </PageContent>
  );
}
