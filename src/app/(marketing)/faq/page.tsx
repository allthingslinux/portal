import Link from 'next/link';

import { ArrowRight, ChevronDown } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Trans } from '~/components/makerkit/trans';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/shared/lib/i18n/i18n.server';
import { withI18n } from '~/shared/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:faq'),
  };
};

async function FAQPage() {
  const { t } = await createI18nServerInstance();

  // replace this content with translations
  const faqItems = [
    {
      // or: t('marketing:faq.question1')
      question: `Do you offer a free trial?`,
      // or: t('marketing:faq.answer1')
      answer: `Yes, we offer a 14-day free trial. You can cancel at any time during the trial period.`,
    },
    {
      question: `Do you offer discounts for non-profits?`,
      answer: `Yes, we offer a 50% discount for non-profits. Please contact us to learn more.`,
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => {
      return {
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      };
    }),
  };

  return (
    <>
      <script
        key={'ld:json'}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={'flex flex-col space-y-4 xl:space-y-8'}>
        <SitePageHeader
          title={t('marketing:faq')}
          subtitle={t('marketing:faqSubtitle')}
        />

        <div className={'container flex flex-col items-center space-y-8 pb-16'}>
          <div className="divide-border flex w-full max-w-xl flex-col divide-y divide-dashed rounded-md border">
            {faqItems.map((item, index) => {
              return <FaqItem key={index} item={item} />;
            })}
          </div>

          <div>
            <Button asChild variant={'outline'}>
              <Link href={'/contact'}>
                <span>
                  <Trans i18nKey={'marketing:contactFaq'} />
                </span>

                <ArrowRight className={'ml-2 w-4'} />
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
        'hover:bg-muted/70 [&:open]:bg-muted/70 [&:open]:hover:bg-muted transition-all'
      }
    >
      <summary
        className={'flex items-center justify-between p-4 hover:cursor-pointer'}
      >
        <h2 className={'cursor-pointer font-sans text-base'}>
          <Trans i18nKey={item.question} defaults={item.question} />
        </h2>

        <div>
          <ChevronDown
            className={'h-5 transition duration-300 group-open:-rotate-180'}
          />
        </div>
      </summary>

      <div className={'text-muted-foreground flex flex-col gap-y-2 px-4 pb-2'}>
        <Trans i18nKey={item.answer} defaults={item.answer} />
      </div>
    </details>
  );
}
