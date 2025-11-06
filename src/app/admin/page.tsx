import { AdminDashboard } from '~/features/admin/components/admin-dashboard';
import { AdminGuard } from '~/features/admin/components/admin-guard';
import { PageBody, PageHeader } from '~/components/makerkit/page';

function AdminPage() {
  return (
    <>
      <PageHeader description={`Super Admin`} />

      <PageBody>
        <AdminDashboard />
      </PageBody>
    </>
  );
}

export default AdminGuard(AdminPage);
