"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { If } from "~/components/makerkit/if";
import { Trans } from "~/components/makerkit/trans";
import { Button } from "~/components/ui/button";

export function BlogPagination(props: {
  currentPage: number;
  canGoToNextPage: boolean;
  canGoToPreviousPage: boolean;
}) {
  const navigate = useGoToPage();

  return (
    <div className={"flex items-center space-x-2"}>
      <If condition={props.canGoToPreviousPage}>
        <Button
          onClick={() => {
            navigate(props.currentPage - 1);
          }}
          variant={"outline"}
        >
          <ArrowLeft className={"mr-2 h-4"} />
          <Trans i18nKey={"marketing:blogPaginationPrevious"} />
        </Button>
      </If>

      <If condition={props.canGoToNextPage}>
        <Button
          onClick={() => {
            navigate(props.currentPage + 1);
          }}
          variant={"outline"}
        >
          <Trans i18nKey={"marketing:blogPaginationNext"} />
          <ArrowRight className={"ml-2 h-4"} />
        </Button>
      </If>
    </div>
  );
}

function useGoToPage() {
  const router = useRouter();
  const path = usePathname();

  return (page: number) => {
    const searchParams = new URLSearchParams({
      page: page.toString(),
    });

    router.push(`${path}?${searchParams.toString()}`);
  };
}
