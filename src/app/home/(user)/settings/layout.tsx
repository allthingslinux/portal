import { AppBreadcrumbs } from "~/components/makerkit/app-breadcrumbs";
import { Trans } from "~/components/makerkit/trans";

import { withI18n } from "~/shared/lib/i18n/with-i18n";

// local imports
import { HomeLayoutPageHeader } from "../_components/home-page-header";

function UserSettingsLayout(props: React.PropsWithChildren) {
  return (
    <>
      <HomeLayoutPageHeader
        description={<AppBreadcrumbs />}
        title={<Trans i18nKey={"account:routes.settings"} />}
      />

      {props.children}
    </>
  );
}

export default withI18n(UserSettingsLayout);
