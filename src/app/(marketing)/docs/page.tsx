import type { Metadata } from "next";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";
import { SitePageHeader } from "../_components/site-page-header";
import { DocsCards } from "./_components/docs-cards";
import { getDocs } from "./_lib/server/docs.loader";

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await createI18nServerInstance();

  return {
    title: t("marketing:documentation"),
  };
};

async function DocsPage() {
  const { t, resolvedLanguage } = await createI18nServerInstance();
  const items = await getDocs(resolvedLanguage);

  // Filter out any docs that have a parentId, as these are children of other docs
  const cards = items.filter((item) => !item.parentId);

  return (
    <div className={"flex w-full flex-1 flex-col gap-y-6 xl:gap-y-8"}>
      <SitePageHeader
        subtitle={t("marketing:documentationSubtitle")}
        title={t("marketing:documentation")}
      />

      <div className={"relative flex size-full justify-center overflow-y-auto"}>
        <DocsCards cards={cards} />
      </div>
    </div>
  );
}

export default withI18n(DocsPage);
