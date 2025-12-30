import { AdminDashboard } from "~/components/features/admin-dashboard";
import { AdminGuard } from "~/components/features/admin-guard";
import { PageBody, PageHeader } from "~/components/page";

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
