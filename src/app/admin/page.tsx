import { PageBody, PageHeader } from "~/components/portal/page";
import { AdminDashboard } from "~/features/admin/components/admin-dashboard";
import { AdminGuard } from "~/features/admin/components/admin-guard";

function AdminPage() {
  return (
    <>
      <PageHeader description={"Super Admin"} />

      <PageBody>
        <AdminDashboard />
      </PageBody>
    </>
  );
}

export default AdminGuard(AdminPage);
