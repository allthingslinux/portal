import type { Metadata } from "next";
import { getRouteMetadata } from "@portal/seo/metadata";
import { PageContent, PageHeader } from "@portal/ui/layout/page";

import { verifySession } from "@/auth/dal";
import { MailContent } from "./mail-content";
import { env } from "@/env";
import { getServerRouteResolver, routeConfig } from "@/features/routing/lib";

export async function generateMetadata(): Promise<Metadata> {
  const resolver = await getServerRouteResolver();
  return getRouteMetadata("/app/mail", routeConfig, resolver);
}

export default async function MailPage() {
  await verifySession();

  const resolver = await getServerRouteResolver();

  return (
    <PageContent>
      <PageHeader pathname="/app/mail" resolver={resolver} />
      <MailContent webmailUrl={env.NEXT_PUBLIC_MAILCOW_WEB_URL} />
    </PageContent>
  );
}
