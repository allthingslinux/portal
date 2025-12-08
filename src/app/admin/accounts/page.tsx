import { AdminAccountsTable } from '~/features/admin/components/admin-accounts-table';
import { AdminCreateUserDialog } from '~/features/admin/components/admin-create-user-dialog';
import { AdminGuard } from '~/features/admin/components/admin-guard';
import { loadAdminAccounts } from '~/features/admin/lib/server/loaders/admin-accounts.loader';
import { AppBreadcrumbs } from '~/components/makerkit/app-breadcrumbs';
import { Button } from '~/components/ui/button';
import { PageBody, PageHeader } from '~/components/makerkit/page';
import { DEFAULT_PAGE_SIZE } from '~/shared/constants';

interface SearchParams {
  page?: string;
  account_type?: 'all' | 'team' | 'personal';
  query?: string;
}

interface AdminAccountsPageProps {
  searchParams: Promise<SearchParams>;
}

export const metadata = {
  title: `Accounts`,
};

async function AccountsPage(props: AdminAccountsPageProps) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const pageSize = DEFAULT_PAGE_SIZE;

  const { data, pageCount } = await loadAdminAccounts({
    page,
    pageSize,
    type: searchParams.account_type ?? 'all',
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
          page={page}
          pageSize={pageSize}
          pageCount={pageCount}
          data={data}
          filters={{
            type: searchParams.account_type ?? 'all',
            query: searchParams.query ?? '',
          }}
        />
      </PageBody>
    </>
  );
}

export default AdminGuard(AccountsPage);
