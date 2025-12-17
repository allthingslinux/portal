import type { Metadata } from "next";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";
import { SitePageHeader } from "../../_components/site-page-header";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await createI18nServerInstance();

  return {
    title: t("marketing:privacyPolicy"),
  };
}

async function PrivacyPolicyPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        subtitle={t("marketing:privacyPolicyDescription")}
        title={t("marketing:privacyPolicy")}
      />

      <div className={"container mx-auto py-8"}>
        <div>Your terms of service content here</div>
      </div>
    </div>
  );
}

export default withI18n(PrivacyPolicyPage);
