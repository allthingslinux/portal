// import { getSupabaseServerClient } from '@portal/supabase/server-client';
// import { createTeamAccountsApi } from '@portal/team-accounts/api';
import { TeamAccountSettingsContainer } from '@portal/team-accounts/components';
import { AppBreadcrumbs } from '@portal/ui/app-breadcrumbs';
import { PageBody } from '@portal/ui/page';
import { Trans } from '@portal/ui/trans';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

// local imports
import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('teams:settings:pageTitle');

  return {
    title,
  };
};

interface TeamAccountSettingsPageProps {
  params: Promise<{ account: string }>;
}

const paths = {
  teamAccountSettings: pathsConfig.app.accountSettings,
};

async function TeamAccountSettingsPage(props: TeamAccountSettingsPageProps) {
  const api = createTeamAccountsApiDrizzle();
  const slug = (await props.params).account;
  const data = await api.getTeamAccount(slug);

  const account = {
    id: data.id,
    name: data.name,
    pictureUrl: data.picture_url,
    slug: data.slug as string,
    primaryOwnerUserId: data.primary_owner_user_id,
  };

  const features = {
    enableTeamDeletion: featuresFlagConfig.enableTeamDeletion,
  };

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={account.slug}
        title={<Trans i18nKey={'teams:settings.pageTitle'} />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className={'flex max-w-2xl flex-1 flex-col'}>
          <TeamAccountSettingsContainer
            account={account}
            paths={paths}
            features={features}
          />
        </div>
      </PageBody>
    </>
  );
}

export default TeamAccountSettingsPage;
