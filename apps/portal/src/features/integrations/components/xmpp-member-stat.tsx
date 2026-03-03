import { Suspense } from "react";
import { Users } from "lucide-react";
import { Skeleton } from "@portal/ui/ui/skeleton";

import { getXmppStats } from "@/features/integrations/lib/xmpp/client";
import { isXmppConfigured } from "@/features/integrations/lib/xmpp/config";

async function XmppMemberStatContent() {
  if (!isXmppConfigured()) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-4 text-primary" />
          </div>
          <span className="font-medium text-muted-foreground text-sm">
            XMPP Users
          </span>
        </div>
        <div className="mt-3">
          <div className="font-bold text-2xl text-foreground tabular-nums">
            —
          </div>
          <p className="mt-0.5 text-muted-foreground text-xs">Not configured</p>
        </div>
      </div>
    );
  }

  try {
    const stats = await getXmppStats();
    const subtitle =
      stats.onlineUsers >= 0
        ? `${stats.onlineUsers.toLocaleString()} online`
        : "registered accounts";

    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-4 text-primary" />
          </div>
          <span className="font-medium text-muted-foreground text-sm">
            XMPP Users
          </span>
        </div>
        <div className="mt-3">
          <div className="font-bold text-2xl text-foreground tabular-nums">
            {stats.registeredUsers.toLocaleString()}
          </div>
          <p className="mt-0.5 text-muted-foreground text-xs">{subtitle}</p>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-4 text-primary" />
          </div>
          <span className="font-medium text-muted-foreground text-sm">
            XMPP Users
          </span>
        </div>
        <div className="mt-3">
          <div className="font-bold text-2xl text-foreground tabular-nums">
            —
          </div>
          <p className="mt-0.5 text-destructive text-xs">Failed to load</p>
        </div>
      </div>
    );
  }
}

export function XmppMemberStat() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
          <div className="flex items-center gap-2">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      }
    >
      <XmppMemberStatContent />
    </Suspense>
  );
}
