import type { Metadata } from "next";
import { use } from "react";
import { PersonalAccountSettingsContainer } from "~/components/features/personal-account-settings";
import { PageBody } from "~/components/page";
import { Trans } from "~/components/trans";
import featureFlagsConfig from "~/lib/config/feature-flags.config";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";
import { requireUserInServerComponent } from "~/shared/lib/server/require-user-in-server-component";
import { HomeLayoutPageHeader } from "../dashboard/_components/home-page-header";

const features = {
  enableAccountDeletion: featureFlagsConfig.enableAccountDeletion,
};

export const generateMetadata = async (): Promise<Metadata> => {
  const i18n = await createI18nServerInstance();
  return { title: i18n.t("account:settingsTab") };
};

function PersonalAccountSettingsPage() {
  const user = use(requireUserInServerComponent());

  return (
    <>
      <HomeLayoutPageHeader
        description={<Trans i18nKey={"account:settingsTabDescription"} />}
        title={<Trans i18nKey={"account:settingsTab"} />}
      />

      <PageBody>
        <div className="w-full">
          <PersonalAccountSettingsContainer
            features={features}
            userId={user.id}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(PersonalAccountSettingsPage);
