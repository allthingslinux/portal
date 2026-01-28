import { connection } from "next/server";

import { AppLayout } from "@/components/layout/app-layout";
import { isAdminOrStaff } from "@/auth/check-role";
import { verifySession } from "@/auth/dal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  // Use DAL to verify session
  // verifySession() uses React's cache() and handles redirects
  const sessionData = await verifySession();

  // Check if user has admin/staff permissions on the server
  // This prevents the sidebar delay by providing permissions immediately
  let canViewAdmin = false;
  try {
    canViewAdmin = await isAdminOrStaff(sessionData.userId);
  } catch (err) {
    // DB unreachable (e.g. ETIMEDOUT): assume non-admin so layout still renders
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn(
        "[DashboardLayout] isAdminOrStaff failed, assuming canViewAdmin=false:",
        err
      );
    }
  }

  return <AppLayout canViewAdmin={canViewAdmin}>{children}</AppLayout>;
}
