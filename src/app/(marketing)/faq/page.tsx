import { ArrowRight, ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SitePageHeader } from "~/(marketing)/_components/site-page-header";
import { Trans } from "~/components/trans";
import { Button } from "~/components/ui/button";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await createI18nServerInstance();

  return {
    title: t("marketing:faq"),
  };
};

async function FAQPage() {
  const { t } = await createI18nServerInstance();

  // replace this content with translations
  const faqItems = [
    {
      // or: t('marketing:faq.question1')
      question: "Do you offer a free trial?",
      // or: t('marketing:faq.answer1')
      answer:
        "Yes, we offer a 14-day free trial. You can cancel at any time during the trial period.",
    },
    {
      question: "Do you offer discounts for non-profits?",
      answer:
        "Yes, we offer a 50% discount for non-profits. Please contact us to learn more.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        key={"ld:json"}
        type="application/ld+json"
      />

      <div className={"flex flex-col space-y-4 xl:space-y-8"}>
        <SitePageHeader
          subtitle={t("marketing:faqSubtitle")}
          title={t("marketing:faq")}
        />

        <div className={"container flex flex-col items-center space-y-8 pb-16"}>
          <div className="flex w-full max-w-xl flex-col divide-y divide-dashed divide-border rounded-md border">
            {faqItems.map((item) => (
              <FaqItem item={item} key={item.question} />
            ))}
          </div>

          <div>
            <Button asChild variant={"outline"}>
              <Link href={"/contact"}>
                <span>
                  <Trans i18nKey={"marketing:contactFaq"} />
                </span>

                <ArrowRight className={"ml-2 w-4"} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default withI18n(FAQPage);

function FaqItem({
  item,
}: React.PropsWithChildren<{
  item: {
    question: string;
    answer: string;
  };
}>) {
  return (
    <details
      className={
        "transition-all hover:bg-muted/70 [&:open]:bg-muted/70 [&:open]:hover:bg-muted"
      }
    >
      <summary
        className={"flex items-center justify-between p-4 hover:cursor-pointer"}
      >
        <h2 className={"cursor-pointer font-sans text-base"}>
          <Trans defaults={item.question} i18nKey={item.question} />
        </h2>

        <div>
          <ChevronDown
            className={"h-5 transition duration-300 group-open:-rotate-180"}
          />
        </div>
      </summary>

      <div className={"flex flex-col gap-y-2 px-4 pb-2 text-muted-foreground"}>
        <Trans defaults={item.answer} i18nKey={item.answer} />
      </div>
    </details>
  );
}
