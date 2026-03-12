import "server-only";

import * as Sentry from "@sentry/nextjs";

import { ircConfig } from "../config";
import type {
  UnrealBanType,
  UnrealChannel,
  UnrealClient,
  UnrealJsonRpcError,
  UnrealJsonRpcSuccess,
  UnrealLogEntry,
  UnrealOperClass,
  UnrealRpcInfo,
  UnrealServer,
  UnrealSpamfilter,
  UnrealStats,
  UnrealTkl,
  UnrealWhowas,
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

function sanitize(value: string): string {
  return value.replace(NEWLINES_REGEX, "").slice(0, 510);
}

/** UnrealIRCd list methods return { list: T[] }, not a raw array. */
function extractList<T>(result: { list?: T[] } | T[] | null | undefined): T[] {
  if (Array.isArray(result)) {
    return result;
  }
  if (result && typeof result === "object" && "list" in result) {
    const list = (result as { list?: T[] }).list;
    return Array.isArray(list) ? list : [];
  }
  return [];
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
    return await Sentry.startSpan(
      {
        op: "http.client",
        name: `UnrealIRCd RPC ${method}`,
        attributes: { "rpc.method": method },
      },
      async () => {
        const fetchOptions: RequestInit = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${getBasicAuth()}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        };

        if (ircConfig.unreal.insecureSkipVerify) {
          const { Agent } = await import("undici");
          // @ts-expect-error - 'dispatcher' is supported by native fetch in Node.js (undici)
          fetchOptions.dispatcher = new Agent({
            connect: {
              rejectUnauthorized: false,
            },
          });
        }

        const response = await fetch(url, fetchOptions);

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
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * UnrealIRCd JSON-RPC client (admin only).
 * Requires IRC_UNREAL_JSONRPC_URL, IRC_UNREAL_RPC_USER, IRC_UNREAL_RPC_PASSWORD.
 */
export const unrealRpcClient = {
  // =========================================================================
  // User
  // =========================================================================

  /** List connected users. object_detail_level: 0, 1, 2, or 4 (default 2). */
  async userList(objectDetailLevel?: 0 | 1 | 2 | 4): Promise<UnrealClient[]> {
    const params: Record<string, unknown> = {};
    if (objectDetailLevel !== undefined) {
      params.object_detail_level = objectDetailLevel;
    }
    try {
      const result = await unrealRequest<
        { list?: UnrealClient[] } | UnrealClient[]
      >("user.list", params);
      return extractList(result);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "user.list" },
      });
      return [];
    }
  },

  /** Get a single user by nick or UID. */
  async userGet(
    nick: string,
    objectDetailLevel?: 0 | 1 | 2 | 4
  ): Promise<UnrealClient | null> {
    const params: Record<string, unknown> = {
      nick: sanitize(nick),
    };
    if (objectDetailLevel !== undefined) {
      params.object_detail_level = objectDetailLevel;
    }
    try {
      const result = await unrealRequest<
        { client?: UnrealClient } | UnrealClient
      >("user.get", params);
      if (result && typeof result === "object" && "client" in result) {
        return (result as { client?: UnrealClient }).client ?? null;
      }
      return (result as UnrealClient) ?? null;
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "user.get" },
        extra: { nick },
      });
      return null;
    }
  },

  /** Force-rename a connected user's nick. */
  async userSetNick(nick: string, newNick: string): Promise<void> {
    await unrealRequest("user.set_nick", {
      nick: sanitize(nick),
      newnick: sanitize(newNick),
    });
  },

  /** Force a user to join a channel. */
  async userJoin(nick: string, channel: string, force = false): Promise<void> {
    await unrealRequest("user.join", {
      nick: sanitize(nick),
      channel: sanitize(channel),
      force,
    });
  },

  /** Force a user to part a channel. */
  async userPart(nick: string, channel: string, force = false): Promise<void> {
    await unrealRequest("user.part", {
      nick: sanitize(nick),
      channel: sanitize(channel),
      force,
    });
  },

  /** Disconnect a user gracefully (QUIT). */
  async userQuit(nick: string, reason: string): Promise<void> {
    await unrealRequest("user.quit", {
      nick: sanitize(nick),
      reason: sanitize(reason),
    });
  },

  /** Kill (force-disconnect) a user with a reason. */
  async userKill(nick: string, reason: string): Promise<void> {
    await unrealRequest("user.kill", {
      nick: sanitize(nick),
      reason: sanitize(reason),
    });
  },

  // =========================================================================
  // Channel
  // =========================================================================

  /** List channels. object_detail_level: 1–4 (default 1). */
  async channelList(
    objectDetailLevel?: 1 | 2 | 3 | 4
  ): Promise<UnrealChannel[]> {
    const params: Record<string, unknown> = {};
    if (objectDetailLevel !== undefined) {
      params.object_detail_level = objectDetailLevel;
    }
    try {
      const result = await unrealRequest<
        { list?: UnrealChannel[] } | UnrealChannel[]
      >("channel.list", params);
      return extractList(result);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "channel.list" },
      });
      return [];
    }
  },

  /** Get a single channel by name. */
  async channelGet(
    channel: string,
    objectDetailLevel?: 1 | 2 | 3 | 4
  ): Promise<UnrealChannel | null> {
    const params: Record<string, unknown> = {
      channel: sanitize(channel),
    };
    if (objectDetailLevel !== undefined) {
      params.object_detail_level = objectDetailLevel;
    }
    try {
      const result = await unrealRequest<
        { channel?: UnrealChannel } | UnrealChannel
      >("channel.get", params);
      if (result && typeof result === "object" && "channel" in result) {
        return (result as { channel?: UnrealChannel }).channel ?? null;
      }
      return (result as UnrealChannel) ?? null;
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "channel.get" },
        extra: { channel },
      });
      return null;
    }
  },

  /** Set channel modes. */
  async channelSetMode(
    channel: string,
    modes: string,
    parameters?: string
  ): Promise<void> {
    const params: Record<string, unknown> = {
      channel: sanitize(channel),
      modes: sanitize(modes),
    };
    if (parameters !== undefined) {
      params.parameters = sanitize(parameters);
    }
    await unrealRequest("channel.set_mode", params);
  },

  /** Set channel topic. */
  async channelSetTopic(
    channel: string,
    topic: string,
    setBy?: string,
    setAt?: string
  ): Promise<void> {
    const params: Record<string, unknown> = {
      channel: sanitize(channel),
      topic: sanitize(topic),
    };
    if (setBy) {
      params.set_by = sanitize(setBy);
    }
    if (setAt) {
      params.set_at = sanitize(setAt);
    }
    await unrealRequest("channel.set_topic", params);
  },

  /** Kick a user from a channel. */
  async channelKick(
    channel: string,
    nick: string,
    reason: string
  ): Promise<void> {
    await unrealRequest("channel.kick", {
      channel: sanitize(channel),
      nick: sanitize(nick),
      reason: sanitize(reason),
    });
  },

  // =========================================================================
  // Server Bans (KLINE / GLINE / ZLINE / GZLINE / SHUN)
  // =========================================================================

  /** Add a server ban (kline, gline, zline, etc.). duration e.g. "1d", "2h". */
  async serverBanAdd(
    name: string,
    type: UnrealBanType,
    reason: string,
    duration = "1d"
  ): Promise<UnrealTkl | null> {
    const result = await unrealRequest<{ tkl?: UnrealTkl }>("server_ban.add", {
      name: sanitize(name),
      type,
      reason: sanitize(reason),
      duration_string: duration,
    });
    return result?.tkl ?? null;
  },

  /** Remove a server ban. */
  async serverBanDelete(
    name: string,
    type: UnrealBanType
  ): Promise<UnrealTkl | null> {
    const result = await unrealRequest<{ tkl?: UnrealTkl }>("server_ban.del", {
      name: sanitize(name),
      type,
    });
    return result?.tkl ?? null;
  },

  /** List all active server bans. */
  async serverBanList(): Promise<UnrealTkl[]> {
    try {
      const result = await unrealRequest<{ list?: UnrealTkl[] } | UnrealTkl[]>(
        "server_ban.list"
      );
      return extractList(result);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "server_ban.list" },
      });
      return [];
    }
  },

  /** Get a specific server ban. */
  async serverBanGet(
    name: string,
    type: UnrealBanType
  ): Promise<UnrealTkl | null> {
    try {
      const result = await unrealRequest<{ tkl?: UnrealTkl }>(
        "server_ban.get",
        { name: sanitize(name), type }
      );
      return result?.tkl ?? null;
    } catch {
      return null;
    }
  },

  // =========================================================================
  // Name Bans (Q-lines — ban nick/channel patterns)
  // =========================================================================

  /** Add a name ban (Q-line). duration "0" = permanent. */
  async nameBanAdd(
    name: string,
    reason: string,
    duration = "0",
    setBy?: string
  ): Promise<UnrealTkl | null> {
    const params: Record<string, unknown> = {
      name: sanitize(name),
      reason: sanitize(reason),
      duration_string: duration,
    };
    if (setBy) {
      params.set_by = sanitize(setBy);
    }
    const result = await unrealRequest<{ tkl?: UnrealTkl }>(
      "name_ban.add",
      params
    );
    return result?.tkl ?? null;
  },

  /** Remove a name ban. */
  async nameBanDelete(name: string): Promise<UnrealTkl | null> {
    const result = await unrealRequest<{ tkl?: UnrealTkl }>("name_ban.del", {
      name: sanitize(name),
    });
    return result?.tkl ?? null;
  },

  /** List all name bans. */
  async nameBanList(): Promise<UnrealTkl[]> {
    try {
      const result = await unrealRequest<{ list?: UnrealTkl[] } | UnrealTkl[]>(
        "name_ban.list"
      );
      return extractList(result);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "name_ban.list" },
      });
      return [];
    }
  },

  /** Get a specific name ban. */
  async nameBanGet(name: string): Promise<UnrealTkl | null> {
    try {
      const result = await unrealRequest<{ tkl?: UnrealTkl }>("name_ban.get", {
        name: sanitize(name),
      });
      return result?.tkl ?? null;
    } catch {
      return null;
    }
  },

  // =========================================================================
  // Server Ban Exceptions (E-lines)
  // =========================================================================

  /** Add a ban exception (E-line). types e.g. "kline,gline". */
  async serverBanExceptionAdd(
    name: string,
    types: string,
    reason: string,
    setBy?: string,
    duration?: string
  ): Promise<UnrealTkl | null> {
    const params: Record<string, unknown> = {
      name: sanitize(name),
      exception_types: sanitize(types),
      reason: sanitize(reason),
    };
    if (setBy) {
      params.set_by = sanitize(setBy);
    }
    if (duration) {
      params.duration_string = duration;
    }
    const result = await unrealRequest<{ tkl?: UnrealTkl }>(
      "server_ban_exception.add",
      params
    );
    return result?.tkl ?? null;
  },

  /** Remove a ban exception. */
  async serverBanExceptionDelete(name: string): Promise<UnrealTkl | null> {
    const result = await unrealRequest<{ tkl?: UnrealTkl }>(
      "server_ban_exception.del",
      { name: sanitize(name) }
    );
    return result?.tkl ?? null;
  },

  /** List all ban exceptions. */
  async serverBanExceptionList(): Promise<UnrealTkl[]> {
    try {
      const result = await unrealRequest<{ list?: UnrealTkl[] } | UnrealTkl[]>(
        "server_ban_exception.list"
      );
      return extractList(result);
    } catch (err) {
      Sentry.captureException(err, {
        tags: {
          integration: "irc-unreal",
          method: "server_ban_exception.list",
        },
      });
      return [];
    }
  },

  /** Get a specific ban exception. */
  async serverBanExceptionGet(name: string): Promise<UnrealTkl | null> {
    try {
      const result = await unrealRequest<{ tkl?: UnrealTkl }>(
        "server_ban_exception.get",
        { name: sanitize(name) }
      );
      return result?.tkl ?? null;
    } catch {
      return null;
    }
  },

  // =========================================================================
  // Stats
  // =========================================================================

  /** Get server statistics. */
  async statsGet(objectDetailLevel: 1 | 2 = 1): Promise<UnrealStats | null> {
    try {
      const result = await unrealRequest<UnrealStats>("stats.get", {
        object_detail_level: objectDetailLevel,
      });
      return result ?? null;
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "stats.get" },
      });
      return null;
    }
  },

  // =========================================================================
  // Whowas
  // =========================================================================

  /** Look up nick history by nick or IP. */
  async whowasGet(
    nick?: string,
    ip?: string,
    objectDetailLevel: 1 | 2 = 2
  ): Promise<UnrealWhowas[]> {
    const params: Record<string, unknown> = {
      object_detail_level: objectDetailLevel,
    };
    if (nick) {
      params.nick = sanitize(nick);
    }
    if (ip) {
      params.ip = sanitize(ip);
    }
    try {
      const result = await unrealRequest<
        { list?: UnrealWhowas[] } | UnrealWhowas[]
      >("whowas.get", params);
      return extractList(result);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "whowas.get" },
      });
      return [];
    }
  },

  // =========================================================================
  // Server
  // =========================================================================

  /** List linked servers. */
  async serverList(): Promise<UnrealServer[]> {
    try {
      const result = await unrealRequest<
        { list?: UnrealServer[] } | UnrealServer[]
      >("server.list");
      return extractList(result);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "server.list" },
      });
      return [];
    }
  },

  /** Get a specific server by name (omit for local server). */
  async serverGet(server?: string): Promise<UnrealServer | null> {
    const params: Record<string, unknown> = {};
    if (server) {
      params.server = sanitize(server);
    }
    try {
      const result = await unrealRequest<
        { server?: UnrealServer } | UnrealServer
      >("server.get", params);
      if (result && typeof result === "object" && "server" in result) {
        return (result as { server?: UnrealServer }).server ?? null;
      }
      return (result as UnrealServer) ?? null;
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "server.get" },
      });
      return null;
    }
  },

  /** Rehash server config. */
  async serverRehash(server?: string): Promise<void> {
    const params: Record<string, unknown> = {};
    if (server) {
      params.server = sanitize(server);
    }
    await unrealRequest("server.rehash", params);
  },

  // =========================================================================
  // Message
  // =========================================================================

  /** Send a PRIVMSG to a connected user. */
  async messageSendPrivmsg(nick: string, message: string): Promise<void> {
    await unrealRequest("message.send_privmsg", {
      nick: sanitize(nick),
      message: sanitize(message),
    });
  },

  /** Send a NOTICE to a connected user. */
  async messageSendNotice(nick: string, message: string): Promise<void> {
    await unrealRequest("message.send_notice", {
      nick: sanitize(nick),
      message: sanitize(message),
    });
  },

  // =========================================================================
  // User — extended setters
  // =========================================================================

  /** Change a user's ident/username. */
  async userSetUsername(nick: string, username: string): Promise<void> {
    await unrealRequest("user.set_username", {
      nick: sanitize(nick),
      username: sanitize(username),
    });
  },

  /** Change a user's GECOS/realname. */
  async userSetRealname(nick: string, realname: string): Promise<void> {
    await unrealRequest("user.set_realname", {
      nick: sanitize(nick),
      realname: sanitize(realname),
    });
  },

  /** Set a virtual host (vhost) for a user. */
  async userSetVhost(nick: string, vhost: string): Promise<void> {
    await unrealRequest("user.set_vhost", {
      nick: sanitize(nick),
      vhost: sanitize(vhost),
    });
  },

  /** Change user modes (e.g. "+i-w"). */
  async userSetMode(nick: string, modes: string): Promise<void> {
    await unrealRequest("user.set_mode", {
      nick: sanitize(nick),
      modes: sanitize(modes),
    });
  },

  /** Change server notice mask for a user. */
  async userSetSnomask(nick: string, snomask: string): Promise<void> {
    await unrealRequest("user.set_snomask", {
      nick: sanitize(nick),
      snomask: sanitize(snomask),
    });
  },

  /**
   * Grant IRC operator status to a user.
   * @param operAccount - oper block name from unrealircd.conf
   * @param operClass   - privilege class to assign
   * @param options     - optional extra flags (e.g. { snomask: "+s" })
   */
  async userSetOper(
    nick: string,
    operAccount: string,
    operClass: UnrealOperClass,
    options?: Record<string, unknown>
  ): Promise<void> {
    const params: Record<string, unknown> = {
      nick: sanitize(nick),
      oper_account: sanitize(operAccount),
      oper_class: operClass,
    };
    if (options) {
      params.options = options;
    }
    await unrealRequest("user.set_oper", params);
  },

  // =========================================================================
  // Server — connect / disconnect
  // =========================================================================

  /** Connect to a linked server by name. */
  async serverConnect(server: string): Promise<void> {
    await unrealRequest("server.connect", {
      server: sanitize(server),
    });
  },

  /** Disconnect a linked server with an optional reason. */
  async serverDisconnect(server: string, reason?: string): Promise<void> {
    const params: Record<string, unknown> = {
      server: sanitize(server),
    };
    if (reason) {
      params.reason = sanitize(reason);
    }
    await unrealRequest("server.disconnect", params);
  },

  // =========================================================================
  // Spamfilter
  // =========================================================================

  /** List all active spamfilters. */
  async spamfilterList(): Promise<UnrealSpamfilter[]> {
    try {
      const result = await unrealRequest<
        { list?: UnrealSpamfilter[] } | UnrealSpamfilter[]
      >("spamfilter.list");
      return extractList(result);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "spamfilter.list" },
      });
      return [];
    }
  },

  /** Get a specific spamfilter by id. */
  async spamfilterGet(id: string): Promise<UnrealSpamfilter | null> {
    try {
      const result = await unrealRequest<UnrealSpamfilter>("spamfilter.get", {
        id: sanitize(id),
      });
      return result ?? null;
    } catch {
      return null;
    }
  },

  /**
   * Add a spamfilter.
   * @param match   - match string or regex
   * @param target  - target flags, e.g. "p" (private), "c" (channel), "pcn"
   * @param action  - action on match, e.g. "block", "kill", "gline"
   * @param reason  - reason shown to user
   * @param duration - duration string, e.g. "1d", "0" for permanent
   */
  async spamfilterAdd(
    match: string,
    target: string,
    action: string,
    reason: string,
    duration = "0"
  ): Promise<UnrealSpamfilter | null> {
    const result = await unrealRequest<{ spamfilter?: UnrealSpamfilter }>(
      "spamfilter.add",
      {
        match: sanitize(match),
        target: sanitize(target),
        action: sanitize(action),
        reason: sanitize(reason),
        duration_string: duration,
      }
    );
    return result?.spamfilter ?? null;
  },

  /** Remove a spamfilter by id. */
  async spamfilterDelete(id: string): Promise<UnrealSpamfilter | null> {
    const result = await unrealRequest<{ spamfilter?: UnrealSpamfilter }>(
      "spamfilter.del",
      { id: sanitize(id) }
    );
    return result?.spamfilter ?? null;
  },

  // =========================================================================
  // Log
  // =========================================================================

  /** Inject a log entry into the server log. */
  async logSend(
    level: string,
    subsystem: string,
    eventId: string,
    msg: string
  ): Promise<void> {
    await unrealRequest("log.send", {
      level: sanitize(level),
      subsystem: sanitize(subsystem),
      event_id: sanitize(eventId),
      msg: sanitize(msg),
    });
  },

  /** List recent log entries. */
  async logList(): Promise<UnrealLogEntry[]> {
    try {
      const result = await unrealRequest<
        { list?: UnrealLogEntry[] } | UnrealLogEntry[]
      >("log.list");
      return extractList(result);
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "log.list" },
      });
      return [];
    }
  },

  /**
   * Subscribe to log events.
   * @param level   - minimum log level, e.g. "info", "warn", "error"
   * @param sources - optional array of subsystem sources to filter
   */
  async logSubscribe(level: string, sources?: string[]): Promise<void> {
    const params: Record<string, unknown> = {
      level: sanitize(level),
    };
    if (sources && sources.length > 0) {
      params.sources = sources.map((s) => sanitize(s));
    }
    await unrealRequest("log.subscribe", params);
  },

  /** Unsubscribe from log events. */
  async logUnsubscribe(): Promise<void> {
    await unrealRequest("log.unsubscribe");
  },

  // =========================================================================
  // RPC Utilities
  // =========================================================================

  /** Get information about the current RPC connection. */
  async rpcInfo(): Promise<UnrealRpcInfo | null> {
    try {
      const result = await unrealRequest<UnrealRpcInfo>("rpc.info");
      return result ?? null;
    } catch (err) {
      Sentry.captureException(err, {
        tags: { integration: "irc-unreal", method: "rpc.info" },
      });
      return null;
    }
  },

  /** Set the issuer name for this RPC connection (shown in server logs). */
  async rpcSetIssuer(issuer: string): Promise<void> {
    await unrealRequest("rpc.set_issuer", {
      issuer: sanitize(issuer),
    });
  },

  /**
   * Schedule a recurring RPC call (timer).
   * @param name     - unique timer name
   * @param request  - the RPC method + params to call on each tick
   * @param every    - interval in seconds
   */
  async rpcAddTimer(
    name: string,
    request: { method: string; params?: Record<string, unknown> },
    every: number
  ): Promise<void> {
    await unrealRequest("rpc.add_timer", {
      timer_name: sanitize(name),
      request,
      every,
    });
  },

  /** Remove a scheduled RPC timer by name. */
  async rpcDelTimer(name: string): Promise<void> {
    await unrealRequest("rpc.del_timer", {
      timer_name: sanitize(name),
    });
  },
};
