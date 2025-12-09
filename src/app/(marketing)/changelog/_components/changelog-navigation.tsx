import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "~/components/lib/utils";
import { If } from "~/components/makerkit/if";
import { Trans } from "~/components/makerkit/trans";
import type { Cms } from "~/features/cms/core";

import { DateFormatter } from "../../blog/_components/date-formatter";

type ChangelogNavigationProps = {
  previousEntry: Cms.ContentItem | null;
  nextEntry: Cms.ContentItem | null;
};

type NavLinkProps = {
  entry: Cms.ContentItem;
  direction: "previous" | "next";
};

function NavLink({ entry, direction }: NavLinkProps) {
  const isPrevious = direction === "previous";

  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  const i18nKey = isPrevious
    ? "marketing:changelogNavigationPrevious"
    : "marketing:changelogNavigationNext";

  return (
    <Link
      className={cn(
        "group flex flex-col gap-2 rounded-lg border border-border/50 p-4 transition-all hover:bg-muted/50",
        !isPrevious && "text-right md:items-end"
      )}
      href={`/changelog/${entry.slug}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {isPrevious && <Icon className="h-3 w-3" />}

        <span className="font-medium uppercase tracking-wider">
          <Trans i18nKey={i18nKey} />
        </span>
        {!isPrevious && <Icon className="h-3 w-3" />}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-sm leading-tight transition-colors group-hover:text-primary">
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
            {(prev) => <NavLink direction="previous" entry={prev} />}
          </If>

          <If condition={nextEntry} fallback={<div />}>
            {(next) => <NavLink direction="next" entry={next} />}
          </If>
        </div>
      </div>
    </div>
  );
}
