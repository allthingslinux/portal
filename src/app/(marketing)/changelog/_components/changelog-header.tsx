import Link from 'next/link';

import { ChevronLeft } from 'lucide-react';

import { Cms } from '~/features/cms/core';
import { If } from '~/components/makerkit/if';
import { Trans } from '~/components/makerkit/trans';
import { cn } from '~/components/lib/utils';

import { CoverImage } from '../../blog/_components/cover-image';
import { DateFormatter } from '../../blog/_components/date-formatter';

export function ChangelogHeader({ entry }: { entry: Cms.ContentItem }) {
  const { title, publishedAt, description, image } = entry;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-border/50 border-b py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/changelog"
            className="text-muted-foreground hover:text-primary flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <Trans i18nKey="marketing:changelog" />
          </Link>
        </div>
      </div>

      <div className={cn('border-border/50 border-b py-8')}>
        <div className="mx-auto flex max-w-3xl flex-col gap-y-2.5">
          <div>
            <span className="text-muted-foreground text-xs">
              <DateFormatter dateString={publishedAt} />
            </span>
          </div>

          <h1 className="font-heading text-2xl font-medium tracking-tighter xl:text-4xl dark:text-white">
            {title}
          </h1>

          {description && (
            <h2
              className="text-muted-foreground text-base"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>

      <If condition={image}>
        {(imageUrl) => (
          <div className="relative mx-auto mt-8 flex h-[378px] w-full max-w-3xl justify-center">
            <CoverImage
              preloadImage
              className="rounded-md"
              title={title}
              src={imageUrl}
            />
          </div>
        )}
      </If>
    </div>
  );
}
