import { SitePageHeader } from "~/(marketing)/_components/site-page-header";
import { ContactForm } from "~/(marketing)/contact/_components/contact-form";
import { Trans } from "~/components/makerkit/trans";
import { Heading } from "~/components/ui/heading";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t("marketing:contact"),
  };
}

async function ContactPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        subtitle={t("marketing:contactDescription")}
        title={t("marketing:contact")}
      />

      <div className={"container mx-auto"}>
        <div
          className={"flex flex-1 flex-col items-center justify-center py-8"}
        >
          <div
            className={
              "flex w-full max-w-lg flex-col space-y-4 rounded-lg border p-8"
            }
          >
            <div>
              <Heading level={3}>
                <Trans i18nKey={"marketing:contactHeading"} />
              </Heading>

              <p className={"text-muted-foreground"}>
                <Trans i18nKey={"marketing:contactSubheading"} />
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(ContactPage);
