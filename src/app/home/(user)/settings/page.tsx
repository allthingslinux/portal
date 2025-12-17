import type { Metadata } from "next";
import { use } from "react";
import { PageBody } from "~/components/portal/page";
import authConfig from "~/config/auth.config";
import featureFlagsConfig from "~/config/feature-flags.config";
import pathsConfig from "~/config/paths.config";
import { PersonalAccountSettingsContainer } from "~/features/accounts/components/personal-account-settings";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";
import { requireUserInServerComponent } from "~/shared/lib/server/require-user-in-server-component";

const features = {
  enableAccountDeletion: featureFlagsConfig.enableAccountDeletion,
  enablePasswordUpdate: authConfig.providers.password,
  enableAccountLinking: authConfig.enableIdentityLinking,
};

const providers = authConfig.providers.oAuth;

const callbackPath = pathsConfig.auth.callback;
const accountSettingsPath = pathsConfig.app.accountSettings;

const paths = {
  callback: `${callbackPath}?next=${accountSettingsPath}`,
};

export const generateMetadata = async (): Promise<Metadata> => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t("account:settingsTab");

  return {
    title,
  };
};

function PersonalAccountSettingsPage() {
  const user = use(requireUserInServerComponent());

  return (
    <PageBody>
      <div className={"flex w-full flex-1 flex-col lg:max-w-2xl"}>
        <PersonalAccountSettingsContainer
          features={features}
          paths={paths}
          providers={providers}
          userId={user.id}
        />
      </div>
    </PageBody>
  );
}

export default withI18n(PersonalAccountSettingsPage);
