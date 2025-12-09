import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Trans } from "~/components/makerkit/trans";
import { Button } from "~/components/ui/button";

type ChangelogPaginationProps = {
  currentPage: number;
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
};

export function ChangelogPagination({
  currentPage,
  canGoToNextPage,
  canGoToPreviousPage,
}: ChangelogPaginationProps) {
  const nextPage = currentPage + 1;
  const previousPage = currentPage - 1;

  return (
    <div className="flex justify-end gap-2">
      {canGoToPreviousPage && (
        <Button asChild size="sm" variant="outline">
          <Link href={`/changelog?page=${previousPage}`}>
            <ArrowLeft className="mr-2 h-3 w-3" />
            <span>
              <Trans i18nKey="marketing:changelogPaginationPrevious" />
            </span>
          </Link>
        </Button>
      )}

      {canGoToNextPage && (
        <Button asChild size="sm" variant="outline">
          <Link href={`/changelog?page=${nextPage}`}>
            <span>
              <Trans i18nKey="marketing:changelogPaginationNext" />
            </span>
            <ArrowRight className="ml-2 h-3 w-3" />
          </Link>
        </Button>
      )}
    </div>
  );
}
