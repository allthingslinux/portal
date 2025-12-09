import { use } from "react";

import { AppBreadcrumbs } from "~/components/makerkit/app-breadcrumbs";
import { PageBody } from "~/components/makerkit/page";
import { Trans } from "~/components/makerkit/trans";

import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

import { DashboardDemo } from "./_components/dashboard-demo";
import { TeamAccountLayoutPageHeader } from "./_components/team-account-layout-page-header";

type TeamAccountHomePageProps = {
  params: Promise<{ account: string }>;
};

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t("teams:home.pageTitle");

  return {
    title,
  };
};

function TeamAccountHomePage({ params }: TeamAccountHomePageProps) {
  const account = use(params).account;

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={account}
        description={<AppBreadcrumbs />}
        title={<Trans i18nKey={"common:routes.dashboard"} />}
      />

      <PageBody>
        <DashboardDemo />
      </PageBody>
    </>
  );
}

export default withI18n(TeamAccountHomePage);
