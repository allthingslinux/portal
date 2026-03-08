import {
  Bot,
  Disc,
  FileText,
  GitFork,
  Globe,
  LayoutDashboard,
  MessageCircle,
  Network,
  ScrollText,
  Server,
  Terminal,
  Wrench,
} from "lucide-react";
import { cn } from "@portal/utils/utils";

/**
 * Map of repo identifiers to their unique icons.
 * Add new repos here as they're added to CHANGELOG_REPOS.
 */
const REPO_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "allthingslinux/portal": LayoutDashboard,
  "allthingslinux/tux": Bot,
  "allthingslinux/atl.tools": Wrench,
  "allthingslinux/atl.services": Server,
  "allthingslinux/atl.network": Network,
  "allthingslinux/atl.chat": MessageCircle,
  "allthingslinux/allthingslinux": Globe,
  "allthingslinux/pubnix": Terminal,
  "allthingslinux/atl-wiki": ScrollText,
  "allthingslinux/code-of-conduct": FileText,
  "allthingslinux/iso.atl.dev": Disc,
};

interface RepoIconProps {
  className?: string;
  repoId: string;
}

/**
 * Renders a unique icon per repository. Falls back to a generic fork icon
 * for repos not explicitly mapped.
 */
export function RepoIcon({ repoId, className }: RepoIconProps) {
  const Icon = REPO_ICONS[repoId] ?? GitFork;
  return <Icon className={cn("size-3.5 text-muted-foreground", className)} />;
}
