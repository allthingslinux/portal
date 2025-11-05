import Link from 'next/link';

import { type Cms } from '@portal/cms';
import { If } from '@portal/ui/if';
import { cn } from '@portal/ui/utils';

import { DateBadge } from './date-badge';

interface ChangelogEntryProps {
  entry: Cms.ContentItem;
  highlight?: boolean;
}

export function ChangelogEntry({
  entry,
  highlight = false,
}: ChangelogEntryProps) {
  const { title, slug, publishedAt, description } = entry;
  const entryUrl = `/changelog/${slug}`;

  return (
    <div className="flex gap-6 md:gap-8">
      <div className="md:border-border relative flex flex-1 flex-col space-y-0 gap-y-2.5 border-l border-dashed border-transparent pb-4 md:pl-8 lg:pl-12">
        {highlight ? (
          <span className="absolute top-5.5 left-0 hidden h-2.5 w-2.5 -translate-x-1/2 md:flex">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400"></span>
          </span>
        ) : (
          <div
            className={cn(
              'bg-muted absolute top-5.5 left-0 hidden h-2.5 w-2.5 -translate-x-1/2 rounded-full md:block',
            )}
          />
        )}

        <div className="hover:bg-muted/50 active:bg-muted rounded-md transition-colors">
          <Link href={entryUrl} className="block space-y-2 p-4">
            <div>
              <DateBadge date={publishedAt} />
            </div>

            <h3 className="text-xl leading-tight font-semibold tracking-tight group-hover/link:underline">
              {title}
            </h3>

            <If condition={description}>
              {(desc) => (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              )}
            </If>
          </Link>
        </div>
      </div>
    </div>
  );
}
