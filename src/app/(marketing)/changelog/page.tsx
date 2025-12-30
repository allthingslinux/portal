import type { Metadata } from "next";
import { cache } from "react";
import { If } from "~/components/if";
import { Trans } from "~/components/trans";
import { createCmsClient } from "~/features/cms/core";
import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";
import { getLogger } from "~/shared/logger";

import { SitePageHeader } from "../_components/site-page-header";
import { ChangelogEntry } from "./_components/changelog-entry";
import { ChangelogPagination } from "./_components/changelog-pagination";

type ChangelogPageProps = {
  searchParams: Promise<{ page?: string }>;
};

const CHANGELOG_ENTRIES_PER_PAGE = 50;

export const generateMetadata = async (
  props: ChangelogPageProps
): Promise<Metadata> => {
  const { t, resolvedLanguage } = await createI18nServerInstance();
  const searchParams = await props.searchParams;
  const limit = CHANGELOG_ENTRIES_PER_PAGE;

  const page = searchParams.page ? Number.parseInt(searchParams.page, 10) : 0;
  const offset = page * limit;

  const { total } = await getContentItems(resolvedLanguage, limit, offset);

  return {
    title: t("marketing:changelog"),
    description: t("marketing:changelogSubtitle"),
    pagination: {
      previous: page > 0 ? `/changelog?page=${page - 1}` : undefined,
      next: offset + limit < total ? `/changelog?page=${page + 1}` : undefined,
    },
  };
};

const getContentItems = cache(
  async (language: string | undefined, limit: number, offset: number) => {
    const client = await createCmsClient();
    const logger = await getLogger();

    try {
      return await client.getContentItems({
        collection: "changelog",
        limit,
        offset,
        content: false,
        language,
        sortBy: "publishedAt",
        sortDirection: "desc",
      });
    } catch (error) {
      logger.error({ error }, "Failed to load changelog entries");

      return { total: 0, items: [] };
    }
  }
);

async function ChangelogPage(props: ChangelogPageProps) {
  const { t, resolvedLanguage: language } = await createI18nServerInstance();
  const searchParams = await props.searchParams;

  const limit = CHANGELOG_ENTRIES_PER_PAGE;
  const page = searchParams.page ? Number.parseInt(searchParams.page, 10) : 0;
  const offset = page * limit;

  const { total, items: entries } = await getContentItems(
    language,
    limit,
    offset
  );

  return (
    <>
      <SitePageHeader
        subtitle={t("marketing:changelogSubtitle")}
        title={t("marketing:changelog")}
      />

      <div className="container flex max-w-4xl flex-col space-y-12 py-12">
        <If
          condition={entries.length > 0}
          fallback={<Trans i18nKey="marketing:noChangelogEntries" />}
        >
          <div className="space-y-0">
            {entries.map((entry, index) => (
              <ChangelogEntry
                entry={entry}
                highlight={index === 0}
                key={entry.id}
              />
            ))}
          </div>

          <ChangelogPagination
            canGoToNextPage={offset + limit < total}
            canGoToPreviousPage={page > 0}
            currentPage={page}
          />
        </If>
      </div>
    </>
  );
}

export default withI18n(ChangelogPage);
