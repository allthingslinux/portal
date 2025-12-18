import { AppLogo } from "~/components/app-logo";
import { Footer } from "~/components/portal/marketing/footer";
import { Trans } from "~/components/portal/trans";
import appConfig from "~/config/app.config";

export function SiteFooter() {
  return (
    <Footer
      copyright={
        <Trans
          i18nKey="marketing:copyright"
          values={{
            product: appConfig.name,
            year: new Date().getFullYear(),
          }}
        />
      }
      description={<Trans i18nKey="marketing:footerDescription" />}
      logo={<AppLogo className="w-[85px] md:w-[95px]" />}
      sections={[
        {
          heading: <Trans i18nKey="marketing:about" />,
          links: [
            { href: "/blog", label: <Trans i18nKey="marketing:blog" /> },
            { href: "/contact", label: <Trans i18nKey="marketing:contact" /> },
          ],
        },
        {
          heading: <Trans i18nKey="marketing:product" />,
          links: [
            {
              href: "/docs",
              label: <Trans i18nKey="marketing:documentation" />,
            },
          ],
        },
        {
          heading: <Trans i18nKey="marketing:legal" />,
          links: [
            {
              href: "/terms-of-service",
              label: <Trans i18nKey="marketing:termsOfService" />,
            },
            {
              href: "/privacy-policy",
              label: <Trans i18nKey="marketing:privacyPolicy" />,
            },
            {
              href: "/cookie-policy",
              label: <Trans i18nKey="marketing:cookiePolicy" />,
            },
          ],
        },
      ]}
    />
  );
}
