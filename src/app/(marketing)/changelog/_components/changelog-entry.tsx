import Link from "next/link";
import { cn } from "~/components/lib/utils";
import { If } from "~/components/portal/if";
import type { Cms } from "~/features/cms/core";

import { DateBadge } from "./date-badge";

type ChangelogEntryProps = {
  entry: Cms.ContentItem;
  highlight?: boolean;
};

export function ChangelogEntry({
  entry,
  highlight = false,
}: ChangelogEntryProps) {
  const { title, slug, publishedAt, description } = entry;
  const entryUrl = `/changelog/${slug}`;

  return (
    <div className="flex gap-6 md:gap-8">
      <div className="relative flex flex-1 flex-col gap-y-2.5 space-y-0 border-transparent border-l border-dashed pb-4 md:border-border md:pl-8 lg:pl-12">
        {highlight ? (
          <span className="absolute top-5.5 left-0 hidden h-2.5 w-2.5 -translate-x-1/2 md:flex">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
          </span>
        ) : (
          <div
            className={cn(
              "absolute top-5.5 left-0 hidden h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-muted md:block"
            )}
          />
        )}

        <div className="rounded-md transition-colors hover:bg-muted/50 active:bg-muted">
          <Link className="block space-y-2 p-4" href={entryUrl}>
            <div>
              <DateBadge date={publishedAt} />
            </div>

            <h3 className="font-semibold text-xl leading-tight tracking-tight group-hover/link:underline">
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
