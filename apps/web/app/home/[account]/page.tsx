import { use } from 'react';

import { AppBreadcrumbs } from '@portal/ui/app-breadcrumbs';
import { PageBody } from '@portal/ui/page';
import { Trans } from '@portal/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { DashboardDemo } from './_components/dashboard-demo';
import { TeamAccountLayoutPageHeader } from './_components/team-account-layout-page-header';

interface TeamAccountHomePageProps {
  params: Promise<{ account: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('teams:home.pageTitle');

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
        title={<Trans i18nKey={'common:routes.dashboard'} />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <DashboardDemo />
      </PageBody>
    </>
  );
}

export default withI18n(TeamAccountHomePage);
