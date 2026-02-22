import { Suspense } from "react";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { env } from "@/env";
import { discord } from "@/features/integrations/lib/discord/client";

async function DiscordStatsCardContent() {
  if (!env.NEXT_PUBLIC_DISCORD_GUILD_ID) {
    return (
      <CardContent>
        <div className="text-muted-foreground text-sm">
          Discord Guild ID not configured.
        </div>
      </CardContent>
    );
  }

  try {
    const guild = await discord.getGuild(
      env.NEXT_PUBLIC_DISCORD_GUILD_ID,
      true
    );

    return (
      <CardContent>
        <div className="flex items-center gap-4">
          {guild.icon && (
            <Image
              alt={`${guild.name} icon`}
              className="h-12 w-12 rounded-full"
              height={48}
              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
              width={48}
            />
          )}
          <div>
            <div className="font-bold text-2xl">
              {guild.approximate_presence_count || 0}
            </div>
            <p className="text-muted-foreground text-xs">Members Online</p>
          </div>
          <div className="ml-auto">
            <div className="font-bold text-2xl text-muted-foreground/50">
              {guild.approximate_member_count || 0}
            </div>
            <p className="text-right text-muted-foreground text-xs">Total</p>
          </div>
        </div>
      </CardContent>
    );
  } catch {
    return (
      <CardContent>
        <div className="text-destructive text-sm">
          Failed to load Discord stats.
        </div>
      </CardContent>
    );
  }
}

export function DiscordStatsCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">Discord Server</CardTitle>
      </CardHeader>
      <Suspense
        fallback={
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardContent>
        }
      >
        <DiscordStatsCardContent />
      </Suspense>
    </Card>
  );
}
