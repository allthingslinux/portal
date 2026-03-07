import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { TooltipProvider } from "../ui/tooltip";
import { AppHeader } from "./header/app-header";
import { SidebarContainer } from "./sidebar/sidebar-container";
import { StatusBar } from "./status-bar";

interface AppLayoutProps {
  canViewAdmin?: boolean;
  children: React.ReactNode;
  defaultSidebarOpen?: boolean;
}

export function AppLayout({
  children,
  canViewAdmin,
  defaultSidebarOpen = true,
}: AppLayoutProps) {
  return (
    <TooltipProvider delay={100}>
      <SidebarProvider className="bg-sidebar" defaultOpen={defaultSidebarOpen}>
        <SidebarContainer canViewAdmin={canViewAdmin} />
        <div className="flex h-svh w-full min-w-0 flex-1 flex-col overflow-hidden bg-canvas">
          <SidebarInset className="min-h-0">
            <AppHeader />
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
              <div className="min-h-0 flex-1 overflow-auto">{children}</div>
              <StatusBar />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
