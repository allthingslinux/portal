import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DynamicAppHeader } from "@/components/layout/dynamic-app-header";
import { isAdminOrStaff } from "@/lib/auth/check-role";
import { verifySession } from "@/lib/dal";

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

  return (
    <SidebarProvider>
      <AppSidebar canViewAdmin={canViewAdmin} />
      <SidebarInset>
        {/* DynamicAppHeader automatically generates breadcrumbs from route */}
        <DynamicAppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
