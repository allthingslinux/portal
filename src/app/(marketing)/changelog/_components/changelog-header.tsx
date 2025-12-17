import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "~/components/lib/utils";
import { If } from "~/components/portal/if";
import { Trans } from "~/components/portal/trans";
import type { Cms } from "~/features/cms/core";

import { CoverImage } from "../../blog/_components/cover-image";
import { DateFormatter } from "../../blog/_components/date-formatter";

export function ChangelogHeader({ entry }: { entry: Cms.ContentItem }) {
  const { title, publishedAt, description, image } = entry;

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-border/50 border-b py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            className="flex items-center gap-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
            href="/changelog"
          >
            <ChevronLeft className="h-4 w-4" />
            <Trans i18nKey="marketing:changelog" />
          </Link>
        </div>
      </div>

      <div className={cn("border-border/50 border-b py-8")}>
        <div className="mx-auto flex max-w-3xl flex-col gap-y-2.5">
          <div>
            <span className="text-muted-foreground text-xs">
              <DateFormatter dateString={publishedAt} />
            </span>
          </div>

          <h1 className="font-heading font-medium text-2xl tracking-tighter xl:text-4xl dark:text-white">
            {title}
          </h1>

          {description && (
            <h2
              className="text-base text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>

      <If condition={image}>
        {(imageUrl) => (
          <div className="relative mx-auto mt-8 flex h-[378px] w-full max-w-3xl justify-center">
            <CoverImage
              className="rounded-md"
              preloadImage
              src={imageUrl}
              title={title}
            />
          </div>
        )}
      </If>
    </div>
  );
}
