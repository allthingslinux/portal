import type { RESTGetAPIGuildResult } from "discord-api-types/v10";

import { env } from "@/env";

// Discord API Version 10 REST endpoints
const DISCORD_API = "https://discord.com/api/v10";

export class DiscordClient {
  private readonly token: string | undefined;

  constructor() {
    this.token = env.DISCORD_BOT_TOKEN;
  }

  /**
   * Universal fetch wrapper for Discord endpoints to inject the Bot token
   */
  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    if (!this.token) {
      throw new Error(
        "Discord Bot Token is not configured (DISCORD_BOT_TOKEN)"
      );
    }

    const response = await fetch(`${DISCORD_API}${path}`, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bot ${this.token}`,
        "Content-Type": "application/json",
      },
      // Cache server info for 60 seconds to respect rate limits
      next: { revalidate: 60, ...options?.next },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Discord API Error (${response.status} ${response.statusText}): ${text}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Fetches the guild (server) info, optionally including approximated member counts
   */
  getGuild(guildId: string, withCounts = true): Promise<RESTGetAPIGuildResult> {
    return this.fetch<RESTGetAPIGuildResult>(
      `/guilds/${guildId}?with_counts=${withCounts}`
    );
  }
}

export const discord = new DiscordClient();
