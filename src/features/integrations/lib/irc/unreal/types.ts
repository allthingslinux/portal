// ============================================================================
// UnrealIRCd JSON-RPC Response Types
// ============================================================================
// DTOs for all UnrealIRCd JSON-RPC methods.
// See https://www.unrealircd.org/docs/JSON-RPC

/**
 * object_detail_level for user.list / user.get: 0, 1, 2, or 4 (not 3).
 * For channel.list / channel.get: 1–4 (channel.list default 1, channel.get default 3).
 */
export type UnrealObjectDetailLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Ban types for server_ban.add/del/get.
 * kline/gline/zline/gzline are IP/host bans; shun silences a user.
 */
export type UnrealBanType =
  | "kline"
  | "gline"
  | "zline"
  | "gzline"
  | "shun"
  | "spamfilter"
  | "qline";

/**
 * Channel member with UID and mode prefix string (e.g. "@", "+", "~", "").
 * Derived from S2S protocol Member type.
 */
export interface UnrealMember {
  uid: string;
  /** Mode prefix chars concatenated, e.g. "@+" for op+voice */
  prefix: string;
}

/**
 * TKL (server ban) entry returned by server_ban.*, name_ban.*, server_ban_exception.*.
 */
export interface UnrealTkl {
  type: string;
  type_string?: string;
  set_by?: string;
  set_at?: string;
  expire_at?: string | null;
  duration_string?: string;
  reason?: string;
  name?: string;
  /** For server_ban_exception: which ban types this exception covers */
  exception_types?: string;
}

/**
 * Stats object from stats.get.
 */
export interface UnrealStats {
  /** Total clients currently connected */
  clients?: number;
  /** Total servers linked */
  servers?: number;
  /** Total channels open */
  channels?: number;
  /** Server uptime in seconds */
  uptime?: number;
  /** Max clients ever connected */
  clients_max?: number;
  /** Total connections since boot */
  connections_total?: number;
  [key: string]: unknown;
}

/**
 * Whowas entry from whowas.get.
 */
export interface UnrealWhowas {
  name?: string;
  hostname?: string;
  ip?: string;
  ident?: string;
  realname?: string;
  account?: string;
  logoff_time?: string;
  servername?: string;
}

/**
 * Server entry from server.list / server.get.
 */
export interface UnrealServer {
  id?: string;
  name: string;
  info?: string;
  uptime?: number;
  num_users?: number;
  num_channels?: number;
  version?: string;
  ulined?: boolean;
}

/**
 * Client (user) object from UnrealIRCd user.list / user.get.
 * Detail level 0+: name, id; 1+: hostname, ip, details; 2+: user, server, etc.
 *
 * away and moddata are sourced from S2S protocol knowledge:
 * - away: set when user has an away message
 * - moddata: module data map (e.g. certfp, swhois, operlogin)
 */
export interface UnrealClient {
  id: string;
  name: string;
  hostname?: string;
  ip?: string;
  details?: string;
  /** Away message if the user is away, undefined if not away */
  away?: string;
  /**
   * Module data map. Common keys:
   * - certfp: TLS certificate fingerprint
   * - swhois: special WHOIS line
   * - operlogin: oper account name
   */
  moddata?: Record<string, string>;
  user?: {
    username?: string;
    realname?: string;
    vhost?: string;
    cloakedhost?: string;
    /** Separate from vhost — the actual cloaked host, not a custom vhost */
    servername?: string;
    account?: string;
    modes?: string;
    channels?: string[] | { name: string; level: string }[];
  };
  server?: Record<string, unknown>;
  connected_since?: string;
  idle_since?: string;
  tls?: { cipher?: string; certfp?: string };
}

/**
 * Channel object from UnrealIRCd channel.list / channel.get.
 * Detail level 0+: name; 1+: creation_time, num_users, topic, modes; 2+: bans, etc.; 3–4: members.
 *
 * bans/ban_exemptions/invite_exceptions are string[] (mask strings) not unknown[],
 * consistent with S2S protocol representation.
 */
export interface UnrealChannel {
  name: string;
  creation_time?: string;
  num_users?: number;
  topic?: string;
  topic_set_by?: string;
  topic_set_at?: string;
  modes?: string;
  /** Ban masks e.g. "*!*@192.168.1.*" */
  bans?: string[];
  /** Ban exception masks (mode +e) */
  ban_exemptions?: string[];
  /** Invite exception masks (mode +I) */
  invite_exceptions?: string[];
  members?: string[] | UnrealClient[];
}

/**
 * JSON-RPC 2.0 request (UnrealIRCd: id string max 32 chars, no newlines; param strings max 510).
 */
export interface UnrealJsonRpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown>;
  id: number | string;
}

/**
 * JSON-RPC 2.0 success response.
 */
export interface UnrealJsonRpcSuccess<T = unknown> {
  jsonrpc: "2.0";
  result: T;
  id: number | string;
}

/**
 * JSON-RPC 2.0 error response.
 */
export interface UnrealJsonRpcError {
  jsonrpc: "2.0";
  error: { code: number; message: string };
  id: number | string;
}

/**
 * IRC operator class levels for user.set_oper.
 */
export type UnrealOperClass =
  | "netadmin-with-override"
  | "netadmin"
  | "sadmin"
  | "admin"
  | "oper"
  | "locop";

/**
 * Spamfilter entry from spamfilter.list / spamfilter.get.
 */
export interface UnrealSpamfilter {
  id?: string;
  /** The match string or regex */
  match?: string;
  /** Target(s) the filter applies to, e.g. "p" (private), "c" (channel) */
  target?: string;
  /** Action taken on match, e.g. "block", "kill", "gline" */
  action?: string;
  set_by?: string;
  set_at?: string;
  expire_at?: string | null;
  reason?: string;
}

/**
 * Log entry from log.list / log.subscribe events.
 */
export interface UnrealLogEntry {
  /** Log level: "debug", "info", "warn", "error", "fatal" */
  level?: string;
  /** Subsystem that generated the log entry, e.g. "server", "channel" */
  subsystem?: string;
  /** Unique event identifier */
  event_id?: string;
  /** Human-readable log message */
  msg?: string;
  /** ISO 8601 timestamp */
  timestamp?: string;
}

/**
 * RPC connection info from rpc.info.
 */
export interface UnrealRpcInfo {
  /** RPC protocol version */
  version?: string;
  /** Loaded RPC modules */
  modules?: string[];
  /** Current issuer name set via rpc.set_issuer */
  issuer?: string;
  [key: string]: unknown;
}
