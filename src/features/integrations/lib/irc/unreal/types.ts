// ============================================================================
// UnrealIRCd JSON-RPC Response Types
// ============================================================================
// DTOs for user.list, user.get, channel.list, channel.get responses.
// See https://www.unrealircd.org/docs/JSON-RPC:User and JSON-RPC:Channel

/**
 * object_detail_level for user.list / user.get: 0, 1, 2, or 4 (not 3).
 * For channel.list / channel.get: 1–4 (channel.list default 1, channel.get default 3).
 */
export type UnrealObjectDetailLevel = 0 | 1 | 2 | 3 | 4;

/**
 * Minimal client (user) object from UnrealIRCd user.list / user.get.
 * Detail level 0+: name, id; 1+: hostname, ip, details; 2+: user, server, etc.
 */
export interface UnrealClient {
  id: string;
  name: string;
  hostname?: string;
  ip?: string;
  details?: string;
  user?: {
    username?: string;
    realname?: string;
    vhost?: string;
    cloakedhost?: string;
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
 * Minimal channel object from UnrealIRCd channel.list / channel.get.
 * Detail level 0+: name; 1+: creation_time, num_users, topic, modes; 2+: bans, etc.; 3–4: members.
 */
export interface UnrealChannel {
  name: string;
  creation_time?: string;
  num_users?: number;
  topic?: string;
  topic_set_by?: string;
  topic_set_at?: string;
  modes?: string;
  bans?: unknown[];
  ban_exemptions?: unknown[];
  invite_exceptions?: unknown[];
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
