import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AppHeader } from "@/components/layout/app-header";
import { isAdminOrStaff } from "@/lib/auth/check-role";
import { auth } from "@/auth";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  // Check if user has admin or staff role (both can access admin panel)
  if (!(await isAdminOrStaff(session.user.id))) {
    redirect("/app");
  }

  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: "App", href: "/app" }, { label: "Admin" }]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <AdminDashboard />
      </div>
    </>
  );
}
