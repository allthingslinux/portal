import { AppBreadcrumbs } from "~/components/portal/app-breadcrumbs";
import { PageBody } from "~/components/portal/page";
import { Trans } from "~/components/portal/trans";
import featuresFlagConfig from "~/config/feature-flags.config";
import pathsConfig from "~/config/paths.config";
import { TeamAccountSettingsContainer } from "~/features/team-accounts/components";
import { createTeamAccountsApi } from "~/features/team-accounts/server/api";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";

// local imports
import { TeamAccountLayoutPageHeader } from "../_components/team-account-layout-page-header";

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t("teams:settings:pageTitle");

  return {
    title,
  };
};

type TeamAccountSettingsPageProps = {
  params: Promise<{ account: string }>;
};

const paths = {
  teamAccountSettings: pathsConfig.app.accountSettings,
};

async function TeamAccountSettingsPage(props: TeamAccountSettingsPageProps) {
  const api = createTeamAccountsApi();
  const slug = (await props.params).account;
  const result = await api.getTeamAccount(slug);

  if (result.error || !result.data) {
    throw new Error(result.error?.message || "Account not found");
  }

  const data = result.data;
  const account = {
    id: data.id,
    name: data.name,
    pictureUrl: data.pictureUrl ?? null,
    slug: (data.slug as string | null) ?? "",
    primaryOwnerUserId: data.primaryOwnerUserId,
  };

  const features = {
    enableTeamDeletion: featuresFlagConfig.enableTeamDeletion,
  };

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={account.slug}
        description={<AppBreadcrumbs />}
        title={<Trans i18nKey={"teams:settings.pageTitle"} />}
      />

      <PageBody>
        <div className={"flex max-w-2xl flex-1 flex-col"}>
          <TeamAccountSettingsContainer
            account={account}
            features={features}
            paths={paths}
          />
        </div>
      </PageBody>
    </>
  );
}

export default TeamAccountSettingsPage;
