import type { Metadata } from "next";

import { AppBreadcrumbs } from "~/components/app-breadcrumbs";
import { AdminAccountsTable } from "~/components/features/admin-accounts-table";
import { AdminGuard } from "~/components/features/admin-guard";
import { PageBody, PageHeader } from "~/components/page";
import { loadAdminAccounts } from "~/features/admin/lib/server/loaders/admin-accounts.loader";
import { DEFAULT_PAGE_SIZE } from "~/shared/constants";

type SearchParams = {
  page?: string;
  account_type?: "all" | "team" | "personal";
  query?: string;
};

type AdminAccountsPageProps = {
  searchParams: Promise<SearchParams>;
};

export const metadata: Metadata = {
  title: "Accounts",
};

async function AccountsPage(props: AdminAccountsPageProps) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number.parseInt(searchParams.page, 10) : 1;
  const pageSize = DEFAULT_PAGE_SIZE;

  const { data, pageCount } = await loadAdminAccounts({
    page,
    pageSize,
    query: searchParams.query,
  });

  return (
    <>
      <PageHeader description={<AppBreadcrumbs />} />

      <PageBody>
        <AdminAccountsTable
          data={data}
          filters={{
            query: searchParams.query ?? "",
          }}
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
        />
      </PageBody>
    </>
  );
}

export default AdminGuard(AccountsPage);
