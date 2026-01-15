"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@daveyplate/better-auth-ui";

import type { FooterAction } from "@/lib/routes/types";
import { authClient } from "@/auth/client";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/ui/sidebar";

interface SidebarUserSectionProps {
  actions: FooterAction[];
}

export function SidebarUserSection({ actions }: SidebarUserSectionProps) {
  const router = useRouter();
  const { state } = useSidebar();
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return null;
  }

  const user = {
    name: session.user.name || session.user.email?.split("@")[0] || "User",
    email: session.user.email || "",
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in");
        },
      },
    });
  };

  return (
    <SidebarMenu>
      {/* User Info */}
      <SidebarMenuItem>
        <SidebarMenuButton disabled size="lg" tooltip={user.name}>
          <UserAvatar
            className="h-8 w-8 shrink-0 rounded-lg"
            user={session.user}
          />
          {state === "expanded" && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-sidebar-foreground/70 text-xs">
                {user.email}
              </span>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Footer Actions */}
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <SidebarMenuItem key={action.id}>
            {action.action === "logout" ? (
              <SidebarMenuButton
                className={
                  action.variant === "destructive"
                    ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                    : undefined
                }
                onClick={handleLogout}
              >
                <Icon />
                <span>{action.label}</span>
              </SidebarMenuButton>
            ) : (
              action.path && (
                <SidebarMenuButton asChild>
                  <Link
                    href={action.path as Parameters<typeof Link>[0]["href"]}
                  >
                    <Icon />
                    <span>{action.label}</span>
                  </Link>
                </SidebarMenuButton>
              )
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
