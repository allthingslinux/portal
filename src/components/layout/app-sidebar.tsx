"use client";

import type React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map as MapIcon,
  PieChart,
  Settings2,
  Shield,
  SquareTerminal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/layout/nav-main";
import { NavProjects } from "@/components/layout/nav-projects";
import { NavUser } from "@/components/layout/nav-user";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import { usePermissions } from "@/hooks/use-permissions";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "/app/projects/design",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "/app/projects/sales",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "/app/projects/travel",
      icon: MapIcon,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  /**
   * Whether the user can view admin section.
   * Passed from server to prevent client-side loading delay.
   */
  canViewAdmin?: boolean;
}

export function AppSidebar({
  canViewAdmin: serverCanViewAdmin,
  ...props
}: AppSidebarProps) {
  // Use server-provided permission if available (prevents delay on page refresh)
  // Only use client-side check if server value is not provided (for flexibility)
  const clientPermissions = usePermissions();
  const canViewAdmin =
    serverCanViewAdmin !== undefined
      ? serverCanViewAdmin
      : clientPermissions.canViewAdmin;

  const navMain = [
    {
      title: "App",
      url: "/app",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/app",
        },
        {
          title: "Analytics",
          url: "/app/analytics",
        },
        {
          title: "Reports",
          url: "/app/reports",
        },
      ],
    },
    {
      title: "Projects",
      url: "/app/projects",
      icon: Bot,
      items: [
        {
          title: "All Projects",
          url: "/app/projects",
        },
        {
          title: "Active",
          url: "/app/projects/active",
        },
        {
          title: "Archived",
          url: "/app/projects/archived",
        },
      ],
    },
    {
      title: "Documentation",
      url: "/docs",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "/docs",
        },
        {
          title: "Getting Started",
          url: "/docs/getting-started",
        },
        {
          title: "API Reference",
          url: "/docs/api",
        },
      ],
    },
    {
      title: "Settings",
      url: "/app/settings",
      icon: Settings2,
    },
    ...(canViewAdmin
      ? [
          {
            title: "Admin",
            url: "/app/admin",
            icon: Shield,
          },
        ]
      : []),
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
