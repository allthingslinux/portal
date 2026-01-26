import { AppLayout } from "@/components/layout/app-layout";
import { isAdminOrStaff } from "@/features/auth/lib/auth/check-role";
import { verifySession } from "@/features/auth/lib/auth/dal";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use DAL to verify session
  // verifySession() uses React's cache() and handles redirects
  const sessionData = await verifySession();

  // Check if user has admin/staff permissions on the server
  // This prevents the sidebar delay by providing permissions immediately
  const canViewAdmin = await isAdminOrStaff(sessionData.userId);

  return <AppLayout canViewAdmin={canViewAdmin}>{children}</AppLayout>;
}
