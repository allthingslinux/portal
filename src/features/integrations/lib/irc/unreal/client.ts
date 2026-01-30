import "server-only";

// biome-ignore lint/performance/noNamespaceImport: Sentry guideline requires namespace import
import * as Sentry from "@sentry/nextjs";

import { ircConfig } from "../config";
import type {
  UnrealChannel,
  UnrealClient,
  UnrealJsonRpcError,
  UnrealJsonRpcSuccess,
} from "./types";

const UNREAL_RPC_TIMEOUT_MS = 15_000;
const UNREAL_RPC_ID_MAX_LENGTH = 32;
const TRAILING_SLASHES_REGEX = /\/+$/;
const NEWLINES_REGEX = /[\r\n]/g;

function getApiUrl(): string {
  const base = ircConfig.unreal.jsonrpcUrl;
  if (!base) {
    throw new Error("IRC_UNREAL_JSONRPC_URL is not configured");
  }
  const normalized = base.replace(TRAILING_SLASHES_REGEX, "");
  if (normalized.endsWith("/api")) {
    return normalized;
  }
  return `${normalized}/api`;
}

function getBasicAuth(): string {
  const user = ircConfig.unreal.rpcUser;
  const password = ircConfig.unreal.rpcPassword;
  if (!user) {
    throw new Error("IRC_UNREAL_RPC_USER is required");
  }
  if (!password) {
    throw new Error("IRC_UNREAL_RPC_PASSWORD is required");
  }
  return Buffer.from(`${user}:${password}`).toString("base64");
}

function sanitizeRpcId(id: number | string): number | string {
  if (typeof id === "number") {
    return id;
  }
  const s = String(id)
    .replace(NEWLINES_REGEX, "")
    .slice(0, UNREAL_RPC_ID_MAX_LENGTH);
  return s || 1;
}

async function unrealRequest<T>(
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const url = getApiUrl();
  const id = sanitizeRpcId(Date.now());

  const body = {
    jsonrpc: "2.0",
    method,
    params: Object.keys(params).length > 0 ? params : undefined,
    id,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UNREAL_RPC_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${getBasicAuth()}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = (await response.json()) as
      | UnrealJsonRpcSuccess<T>
      | UnrealJsonRpcError;

    if (!response.ok) {
      const err = data as UnrealJsonRpcError;
      throw new Error(
        err.error?.message ?? `UnrealIRCd RPC error: ${response.status}`
      );
    }

    if ("error" in data && data.error) {
      const err = data as UnrealJsonRpcError;
      throw new Error(err.error.message ?? "UnrealIRCd RPC fault");
    }

    const success = data as UnrealJsonRpcSuccess<T>;
    return success.result;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * UnrealIRCd JSON-RPC client (admin only). Use for "who's online", channel list, etc.
 * Requires IRC_UNREAL_JSONRPC_URL, IRC_UNREAL_RPC_USER, IRC_UNREAL_RPC_PASSWORD.
 */
export const unrealRpcClient = {
  /**
   * List connected users. object_detail_level: 0, 1, 2, or 4 (default 2).
   */
  async userList(objectDetailLevel?: 0 | 1 | 2 | 4): Promise<UnrealClient[]> {
    const params: Record<string, unknown> = {};
    if (objectDetailLevel !== undefined) {
      params.object_detail_level = objectDetailLevel;
    }
    const result = await unrealRequest<UnrealClient[]>("user.list", params);
    return Array.isArray(result) ? result : [];
  },

  /**
   * Get a single user by nick or UID.
   */
  async userGet(
    nick: string,
    objectDetailLevel?: 0 | 1 | 2 | 4
  ): Promise<UnrealClient | null> {
    const params: Record<string, unknown> = {
      nick: nick.replace(NEWLINES_REGEX, "").slice(0, 510),
    };
    if (objectDetailLevel !== undefined) {
      params.object_detail_level = objectDetailLevel;
    }
    try {
      const result = await unrealRequest<UnrealClient>("user.get", params);
      return result ?? null;
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "user.get" },
        extra: { nick },
      });
      return null;
    }
  },

  /**
   * List channels. object_detail_level: 1–4 (default 1).
   */
  async channelList(
    objectDetailLevel?: 1 | 2 | 3 | 4
  ): Promise<UnrealChannel[]> {
    const params: Record<string, unknown> = {};
    if (objectDetailLevel !== undefined) {
      params.object_detail_level = objectDetailLevel;
    }
    const result = await unrealRequest<UnrealChannel[]>("channel.list", params);
    return Array.isArray(result) ? result : [];
  },

  /**
   * Get a single channel by name.
   */
  async channelGet(
    channel: string,
    objectDetailLevel?: 1 | 2 | 3 | 4
  ): Promise<UnrealChannel | null> {
    const params: Record<string, unknown> = {
      channel: channel.replace(NEWLINES_REGEX, "").slice(0, 510),
    };
    if (objectDetailLevel !== undefined) {
      params.object_detail_level = objectDetailLevel;
    }
    try {
      const result = await unrealRequest<UnrealChannel>("channel.get", params);
      return result ?? null;
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "channel.get" },
        extra: { channel },
      });
      return null;
    }
  },
};
