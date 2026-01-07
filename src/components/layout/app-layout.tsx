import { AppHeader } from "./header/app-header";
import { SidebarContainer } from "./sidebar/sidebar-container";
import { SidebarInset, SidebarProvider } from "@/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  canViewAdmin?: boolean;
}

export function AppLayout({ children, canViewAdmin }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <SidebarContainer canViewAdmin={canViewAdmin} />
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
