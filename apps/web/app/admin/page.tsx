import { AdminDashboard } from '@portal/admin/components/admin-dashboard';
import { AdminGuard } from '@portal/admin/components/admin-guard';
import { PageBody, PageHeader } from '@portal/ui/page';

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
