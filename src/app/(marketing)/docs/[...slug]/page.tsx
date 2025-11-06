import { cache } from 'react';

import { notFound } from 'next/navigation';

import { ContentRenderer, createCmsClient } from '~/features/cms/core';
import { If } from '~/components/makerkit/if';
import { Separator } from '~/components/ui/separator';
import { cn } from '~/components/lib/utils';

import { withI18n } from '~/shared/lib/i18n/with-i18n';

// local imports
import { DocsCards } from '../_components/docs-cards';

const getPageBySlug = cache(pageLoader);

interface DocumentationPageProps {
  params: Promise<{ slug: string[] }>;
}

async function pageLoader(slug: string) {
  const client = await createCmsClient();

  return client.getContentItemBySlug({ slug, collection: 'documentation' });
}

export const generateMetadata = async ({ params }: DocumentationPageProps) => {
  const slug = (await params).slug.join('/');
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const { title, description } = page;

  return {
    title,
    description,
  };
};

async function DocumentationPage({ params }: DocumentationPageProps) {
  const slug = (await params).slug.join('/');
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const description = page?.description ?? '';

  return (
    <div className={'flex flex-1 flex-col gap-y-4 overflow-y-hidden'}>
      <div className={'flex size-full overflow-y-hidden'}>
        <div className="relative size-full">
          <article
            className={cn(
              'absolute size-full w-full gap-y-12 overflow-y-auto pt-4 pb-36',
            )}
          >
            <section
              className={'flex flex-col gap-y-1 border-b border-dashed pb-4'}
            >
              <h1
                className={
                  'text-foreground text-3xl font-semibold tracking-tighter'
                }
              >
                {page.title}
              </h1>

              <h2 className={'text-secondary-foreground/80 text-lg'}>
                {description}
              </h2>
            </section>

            <div className={'markdoc'}>
              <ContentRenderer content={page.content} />
            </div>
          </article>
        </div>
      </div>

      <If condition={page.children.length > 0}>
        <Separator />

        <DocsCards cards={page.children ?? []} />
      </If>
    </div>
  );
}

export default withI18n(DocumentationPage);
