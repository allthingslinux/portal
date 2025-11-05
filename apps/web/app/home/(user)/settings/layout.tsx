import { AppBreadcrumbs } from '@portal/ui/app-breadcrumbs';
import { Trans } from '@portal/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

// local imports
import { HomeLayoutPageHeader } from '../_components/home-page-header';

function UserSettingsLayout(props: React.PropsWithChildren) {
  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'account:routes.settings'} />}
        description={<AppBreadcrumbs />}
      />

      {props.children}
    </>
  );
}

export default withI18n(UserSettingsLayout);
