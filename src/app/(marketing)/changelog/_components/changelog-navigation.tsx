import Link from 'next/link';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Cms } from '~/features/cms/core';
import { If } from '~/components/makerkit/if';
import { Trans } from '~/components/makerkit/trans';
import { cn } from '~/components/lib/utils';

import { DateFormatter } from '../../blog/_components/date-formatter';

interface ChangelogNavigationProps {
  previousEntry: Cms.ContentItem | null;
  nextEntry: Cms.ContentItem | null;
}

interface NavLinkProps {
  entry: Cms.ContentItem;
  direction: 'previous' | 'next';
}

function NavLink({ entry, direction }: NavLinkProps) {
  const isPrevious = direction === 'previous';

  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  const i18nKey = isPrevious
    ? 'marketing:changelogNavigationPrevious'
    : 'marketing:changelogNavigationNext';

  return (
    <Link
      href={`/changelog/${entry.slug}`}
      className={cn(
        'border-border/50 hover:bg-muted/50 group flex flex-col gap-2 rounded-lg border p-4 transition-all',
        !isPrevious && 'text-right md:items-end',
      )}
    >
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        {isPrevious && <Icon className="h-3 w-3" />}

        <span className="font-medium tracking-wider uppercase">
          <Trans i18nKey={i18nKey} />
        </span>
        {!isPrevious && <Icon className="h-3 w-3" />}
      </div>

      <div className="space-y-1">
        <h3 className="group-hover:text-primary text-sm leading-tight font-semibold transition-colors">
          {entry.title}
        </h3>

        <div className="text-muted-foreground text-xs">
          <DateFormatter dateString={entry.publishedAt} />
        </div>
      </div>
    </Link>
  );
}

export function ChangelogNavigation({
  previousEntry,
  nextEntry,
}: ChangelogNavigationProps) {
  return (
    <div className="border-border/50 border-t py-8">
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <If condition={previousEntry} fallback={<div />}>
            {(prev) => <NavLink entry={prev} direction="previous" />}
          </If>

          <If condition={nextEntry} fallback={<div />}>
            {(next) => <NavLink entry={next} direction="next" />}
          </If>
        </div>
      </div>
    </div>
  );
}
