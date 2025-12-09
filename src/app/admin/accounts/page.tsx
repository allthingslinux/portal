import { AppBreadcrumbs } from "~/components/makerkit/app-breadcrumbs";
import { PageBody, PageHeader } from "~/components/makerkit/page";
import { Button } from "~/components/ui/button";
import { AdminAccountsTable } from "~/features/admin/components/admin-accounts-table";
import { AdminCreateUserDialog } from "~/features/admin/components/admin-create-user-dialog";
import { AdminGuard } from "~/features/admin/components/admin-guard";
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

export const metadata = {
  title: "Accounts",
};

async function AccountsPage(props: AdminAccountsPageProps) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number.parseInt(searchParams.page, 10) : 1;
  const pageSize = DEFAULT_PAGE_SIZE;

  const { data, pageCount } = await loadAdminAccounts({
    page,
    pageSize,
    type: searchParams.account_type ?? "all",
    query: searchParams.query,
  });

  return (
    <>
      <PageHeader description={<AppBreadcrumbs />}>
        <div className="flex justify-end">
          <AdminCreateUserDialog>
            <Button data-test="admin-create-user-button">Create User</Button>
          </AdminCreateUserDialog>
        </div>
      </PageHeader>

      <PageBody>
        <AdminAccountsTable
          data={data}
          filters={{
            type: searchParams.account_type ?? "all",
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
