import { cache } from 'react';

import type { Metadata } from 'next';

import { notFound } from 'next/navigation';

import { createCmsClient } from '~/features/cms/core';

import { withI18n } from '~/shared/lib/i18n/with-i18n';

import { ChangelogDetail } from '../_components/changelog-detail';

interface ChangelogEntryPageProps {
  params: Promise<{ slug: string }>;
}

const getChangelogData = cache(changelogEntryLoader);

async function changelogEntryLoader(slug: string) {
  const client = await createCmsClient();

  const [entry, allEntries] = await Promise.all([
    client.getContentItemBySlug({ slug, collection: 'changelog' }),
    client.getContentItems({
      collection: 'changelog',
      sortBy: 'publishedAt',
      sortDirection: 'desc',
      content: false,
    }),
  ]);

  if (!entry) {
    return null;
  }

  // Find previous and next entries in the timeline
  const currentIndex = allEntries.items.findIndex((item) => item.slug === slug);
  const previousEntry =
    currentIndex > 0 ? allEntries.items[currentIndex - 1] : null;
  const nextEntry =
    currentIndex < allEntries.items.length - 1
      ? allEntries.items[currentIndex + 1]
      : null;

  return {
    entry,
    previousEntry,
    nextEntry,
  };
}

export async function generateMetadata({
  params,
}: ChangelogEntryPageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const data = await getChangelogData(slug);

  if (!data) {
    notFound();
  }

  const { title, publishedAt, description, image } = data.entry;

  return Promise.resolve({
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: publishedAt,
      url: data.entry.url,
      images: image
        ? [
            {
              url: image,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  });
}

async function ChangelogEntryPage({ params }: ChangelogEntryPageProps) {
  const slug = (await params).slug;
  const data = await getChangelogData(slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="container sm:max-w-none sm:p-0">
      <ChangelogDetail
        entry={data.entry}
        content={data.entry.content}
        previousEntry={data.previousEntry ?? null}
        nextEntry={data.nextEntry ?? null}
      />
    </div>
  );
}

export default withI18n(ChangelogEntryPage);
