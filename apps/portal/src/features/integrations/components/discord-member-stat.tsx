import { Suspense } from "react";
import { Users } from "lucide-react";
import { Skeleton } from "@portal/ui/ui/skeleton";

import { env } from "@/env";
import { discord } from "@/features/integrations/lib/discord/client";

async function DiscordMemberStatContent() {
  if (!env.NEXT_PUBLIC_DISCORD_GUILD_ID) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-4 text-primary" />
          </div>
          <span className="font-medium text-muted-foreground text-sm">
            Discord Members
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
    const guild = await discord.getGuild(
      env.NEXT_PUBLIC_DISCORD_GUILD_ID,
      true
    );
    const total = guild.approximate_member_count ?? 0;
    const online = guild.approximate_presence_count ?? 0;

    return (
      <div className="rounded-xl border border-border/60 bg-card/50 p-4 dark:border-border/40 dark:bg-card/30">
        <div className="flex items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-4 text-primary" />
          </div>
          <span className="font-medium text-muted-foreground text-sm">
            Discord Members
          </span>
        </div>
        <div className="mt-3">
          <div className="font-bold text-2xl text-foreground tabular-nums">
            {total.toLocaleString()}
          </div>
          <p className="mt-0.5 text-muted-foreground text-xs">
            {online.toLocaleString()} online
          </p>
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
            Discord Members
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

export function DiscordMemberStat() {
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
      <DiscordMemberStatContent />
    </Suspense>
  );
}
