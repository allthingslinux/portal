import { PageBody } from "~/components/page";
import { Trans } from "~/components/trans";

import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

import { HomeLayoutPageHeader } from "./_components/home-page-header";

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t("account:homePage");

  return {
    title,
  };
};

function UserHomePage() {
  return (
    <>
      <HomeLayoutPageHeader
        description={<Trans i18nKey={"common:homeTabDescription"} />}
        title={<Trans i18nKey={"common:routes.home"} />}
      />

      <PageBody />
    </>
  );
}

export default withI18n(UserHomePage);
