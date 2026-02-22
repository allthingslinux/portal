/**
 * Tests for the extended UnrealIRCd RPC client methods.
 * Covers all methods added in the n8n-nodes-unrealircd audit:
 *   - User extended setters: userSetUsername, userSetRealname, userSetVhost,
 *     userSetMode, userSetSnomask, userSetOper
 *   - Server: serverConnect, serverDisconnect
 *   - Spamfilter: spamfilterList, spamfilterGet, spamfilterAdd, spamfilterDelete
 *   - Log: logSend, logList, logSubscribe, logUnsubscribe
 *   - RPC utilities: rpcInfo, rpcSetIssuer, rpcAddTimer, rpcDelTimer
 */

process.env.SKIP_ENV_VALIDATION = "true";

import { afterEach, describe, expect, it, vi } from "vitest";

import { unrealRpcClient } from "@/features/integrations/lib/irc/unreal/client";

// ---------------------------------------------------------------------------
// Global mocks
// ---------------------------------------------------------------------------

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

vi.mock("@sentry/nextjs", () => ({
  startSpan: vi.fn((_, cb) => cb()),
  captureException: vi.fn(),
}));

vi.mock("@/features/integrations/lib/irc/keys", () => ({
  keys: () => ({}),
}));

vi.mock("@/features/integrations/lib/irc/config", () => ({
  ircConfig: {
    unreal: {
      jsonrpcUrl: "http://mock-unreal/jsonrpc",
      rpcUser: "rpcuser",
      rpcPassword: "rpcpassword",
      insecureSkipVerify: false,
    },
  },
  isIrcConfigured: () => true,
  isUnrealConfigured: () => true,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Mock a successful JSON-RPC response. */
function mockOk(result: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ jsonrpc: "2.0", result, id: 1 }),
  });
}

/** Mock a failed HTTP response (non-2xx). */
function mockErr(message = "Internal Server Error", status = 500) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error: { message } }),
  });
}

/** Assert the last fetch call sent the given RPC method. */
function expectMethod(method: string) {
  // biome-ignore lint/suspicious/noMisplacedAssertion: intentional test helper
  expect(mockFetch).toHaveBeenCalledWith(
    "http://mock-unreal/jsonrpc/api",
    expect.objectContaining({
      method: "POST",
      body: expect.stringContaining(`"method":"${method}"`),
    })
  );
}

/** Assert the last fetch body contains a specific param key+value. */
function expectParam(key: string, value: unknown) {
  type FetchCall = [string, { body: string }];
  const allCalls = mockFetch.mock.calls as FetchCall[];
  const lastCall = allCalls.at(-1) ?? (["", { body: "{}" }] as FetchCall);
  const body = JSON.parse(lastCall[1].body) as Record<string, unknown>;
  const params = body.params as Record<string, unknown>;
  // biome-ignore lint/suspicious/noMisplacedAssertion: intentional test helper
  expect(params[key]).toEqual(value);
}

afterEach(() => {
  vi.clearAllMocks();
});

// ===========================================================================
// User — extended setters
// ===========================================================================

describe("userSetUsername", () => {
  it("sends user.set_username with nick and username", async () => {
    mockOk(true);
    await unrealRpcClient.userSetUsername("alice", "alice_ident");
    expectMethod("user.set_username");
    expectParam("nick", "alice");
    expectParam("username", "alice_ident");
  });

  it("throws on RPC error", async () => {
    mockErr("Permission denied");
    await expect(unrealRpcClient.userSetUsername("alice", "x")).rejects.toThrow(
      "Permission denied"
    );
  });
});

describe("userSetRealname", () => {
  it("sends user.set_realname with nick and realname", async () => {
    mockOk(true);
    await unrealRpcClient.userSetRealname("alice", "Alice Smith");
    expectMethod("user.set_realname");
    expectParam("nick", "alice");
    expectParam("realname", "Alice Smith");
  });

  it("throws on RPC error", async () => {
    mockErr("Not found");
    await expect(unrealRpcClient.userSetRealname("ghost", "x")).rejects.toThrow(
      "Not found"
    );
  });
});

describe("userSetVhost", () => {
  it("sends user.set_vhost with nick and vhost", async () => {
    mockOk(true);
    await unrealRpcClient.userSetVhost("alice", "users.atl.chat");
    expectMethod("user.set_vhost");
    expectParam("nick", "alice");
    expectParam("vhost", "users.atl.chat");
  });

  it("throws on RPC error", async () => {
    mockErr("Invalid vhost");
    await expect(
      unrealRpcClient.userSetVhost("alice", "bad vhost")
    ).rejects.toThrow("Invalid vhost");
  });
});

describe("userSetMode", () => {
  it("sends user.set_mode with nick and modes", async () => {
    mockOk(true);
    await unrealRpcClient.userSetMode("alice", "+i-w");
    expectMethod("user.set_mode");
    expectParam("nick", "alice");
    expectParam("modes", "+i-w");
  });

  it("throws on RPC error", async () => {
    mockErr("Unknown mode");
    await expect(unrealRpcClient.userSetMode("alice", "+Z")).rejects.toThrow(
      "Unknown mode"
    );
  });
});

describe("userSetSnomask", () => {
  it("sends user.set_snomask with nick and snomask", async () => {
    mockOk(true);
    await unrealRpcClient.userSetSnomask("alice", "+s");
    expectMethod("user.set_snomask");
    expectParam("nick", "alice");
    expectParam("snomask", "+s");
  });

  it("throws on RPC error", async () => {
    mockErr("Not an oper");
    await expect(unrealRpcClient.userSetSnomask("alice", "+s")).rejects.toThrow(
      "Not an oper"
    );
  });
});

describe("userSetOper", () => {
  it("sends user.set_oper with required params", async () => {
    mockOk(true);
    await unrealRpcClient.userSetOper("alice", "alice-oper", "netadmin");
    expectMethod("user.set_oper");
    expectParam("nick", "alice");
    expectParam("oper_account", "alice-oper");
    expectParam("oper_class", "netadmin");
  });

  it("includes options when provided", async () => {
    mockOk(true);
    await unrealRpcClient.userSetOper("alice", "alice-oper", "oper", {
      snomask: "+s",
    });
    const call = mockFetch.mock.calls[0];
    const body = JSON.parse(call[1].body as string) as Record<string, unknown>;
    const params = body.params as Record<string, unknown>;
    expect(params.options).toEqual({ snomask: "+s" });
  });

  it("throws on RPC error", async () => {
    mockErr("No such oper block");
    await expect(
      unrealRpcClient.userSetOper("alice", "bad-block", "oper")
    ).rejects.toThrow("No such oper block");
  });
});

// ===========================================================================
// Server — connect / disconnect
// ===========================================================================

describe("serverConnect", () => {
  it("sends server.connect with server name", async () => {
    mockOk(true);
    await unrealRpcClient.serverConnect("hub.atl.chat");
    expectMethod("server.connect");
    expectParam("server", "hub.atl.chat");
  });

  it("throws on RPC error", async () => {
    mockErr("Connection refused");
    await expect(unrealRpcClient.serverConnect("hub.atl.chat")).rejects.toThrow(
      "Connection refused"
    );
  });
});

describe("serverDisconnect", () => {
  it("sends server.disconnect with server name", async () => {
    mockOk(true);
    await unrealRpcClient.serverDisconnect("hub.atl.chat");
    expectMethod("server.disconnect");
    expectParam("server", "hub.atl.chat");
  });

  it("includes reason when provided", async () => {
    mockOk(true);
    await unrealRpcClient.serverDisconnect("hub.atl.chat", "maintenance");
    expectParam("reason", "maintenance");
  });

  it("throws on RPC error", async () => {
    mockErr("Server not linked");
    await expect(
      unrealRpcClient.serverDisconnect("ghost.atl.chat")
    ).rejects.toThrow("Server not linked");
  });
});

// ===========================================================================
// Spamfilter
// ===========================================================================

describe("spamfilterList", () => {
  it("returns list of spamfilters", async () => {
    const filters = [{ id: "sf1", match: "badword", action: "block" }];
    mockOk(filters);
    const result = await unrealRpcClient.spamfilterList();
    expect(result).toEqual(filters);
    expectMethod("spamfilter.list");
  });

  it("returns empty array on error", async () => {
    mockErr();
    const result = await unrealRpcClient.spamfilterList();
    expect(result).toEqual([]);
  });

  it("returns empty array when result is not an array", async () => {
    mockOk(null);
    const result = await unrealRpcClient.spamfilterList();
    expect(result).toEqual([]);
  });
});

describe("spamfilterGet", () => {
  it("returns a spamfilter by id", async () => {
    const filter = { id: "sf1", match: "badword" };
    mockOk(filter);
    const result = await unrealRpcClient.spamfilterGet("sf1");
    expect(result).toEqual(filter);
    expectMethod("spamfilter.get");
    expectParam("id", "sf1");
  });

  it("returns null on error", async () => {
    mockErr("Not found");
    const result = await unrealRpcClient.spamfilterGet("missing");
    expect(result).toBeNull();
  });
});

describe("spamfilterAdd", () => {
  it("sends spamfilter.add with all required params", async () => {
    const filter = { id: "sf2", match: "spam", action: "block" };
    mockOk({ spamfilter: filter });
    const result = await unrealRpcClient.spamfilterAdd(
      "spam",
      "pc",
      "block",
      "No spam",
      "1d"
    );
    expect(result).toEqual(filter);
    expectMethod("spamfilter.add");
    expectParam("match", "spam");
    expectParam("target", "pc");
    expectParam("action", "block");
    expectParam("reason", "No spam");
    expectParam("duration_string", "1d");
  });

  it("uses default duration of 0 (permanent)", async () => {
    mockOk({ spamfilter: { id: "sf3" } });
    await unrealRpcClient.spamfilterAdd("x", "p", "block", "reason");
    expectParam("duration_string", "0");
  });

  it("returns null when result has no spamfilter key", async () => {
    mockOk({});
    const result = await unrealRpcClient.spamfilterAdd(
      "x",
      "p",
      "block",
      "reason"
    );
    expect(result).toBeNull();
  });

  it("throws on RPC error", async () => {
    mockErr("Invalid regex");
    await expect(
      unrealRpcClient.spamfilterAdd("(bad", "p", "block", "reason")
    ).rejects.toThrow("Invalid regex");
  });
});

describe("spamfilterDelete", () => {
  it("sends spamfilter.del with id", async () => {
    const filter = { id: "sf1" };
    mockOk({ spamfilter: filter });
    const result = await unrealRpcClient.spamfilterDelete("sf1");
    expect(result).toEqual(filter);
    expectMethod("spamfilter.del");
    expectParam("id", "sf1");
  });

  it("returns null when result has no spamfilter key", async () => {
    mockOk({});
    const result = await unrealRpcClient.spamfilterDelete("sf1");
    expect(result).toBeNull();
  });

  it("throws on RPC error", async () => {
    mockErr("Not found");
    await expect(unrealRpcClient.spamfilterDelete("missing")).rejects.toThrow(
      "Not found"
    );
  });
});

// ===========================================================================
// Log
// ===========================================================================

describe("logSend", () => {
  it("sends log.send with all params", async () => {
    mockOk(true);
    await unrealRpcClient.logSend(
      "info",
      "server",
      "EVT_001",
      "Server started"
    );
    expectMethod("log.send");
    expectParam("level", "info");
    expectParam("subsystem", "server");
    expectParam("event_id", "EVT_001");
    expectParam("msg", "Server started");
  });

  it("throws on RPC error", async () => {
    mockErr("Invalid level");
    await expect(
      unrealRpcClient.logSend("bad", "server", "EVT", "msg")
    ).rejects.toThrow("Invalid level");
  });
});

describe("logList", () => {
  it("returns list of log entries", async () => {
    const entries = [{ level: "info", msg: "Server started" }];
    mockOk(entries);
    const result = await unrealRpcClient.logList();
    expect(result).toEqual(entries);
    expectMethod("log.list");
  });

  it("returns empty array on error", async () => {
    mockErr();
    const result = await unrealRpcClient.logList();
    expect(result).toEqual([]);
  });

  it("returns empty array when result is not an array", async () => {
    mockOk(null);
    const result = await unrealRpcClient.logList();
    expect(result).toEqual([]);
  });
});

describe("logSubscribe", () => {
  it("sends log.subscribe with level", async () => {
    mockOk(true);
    await unrealRpcClient.logSubscribe("warn");
    expectMethod("log.subscribe");
    expectParam("level", "warn");
  });

  it("includes sources when provided", async () => {
    mockOk(true);
    await unrealRpcClient.logSubscribe("info", ["server", "channel"]);
    expectParam("sources", ["server", "channel"]);
  });

  it("does not include sources when empty array", async () => {
    mockOk(true);
    await unrealRpcClient.logSubscribe("info", []);
    const call = mockFetch.mock.calls[0];
    const body = JSON.parse(call[1].body as string) as Record<string, unknown>;
    const params = body.params as Record<string, unknown>;
    expect(params).not.toHaveProperty("sources");
  });

  it("throws on RPC error", async () => {
    mockErr("Not authorized");
    await expect(unrealRpcClient.logSubscribe("info")).rejects.toThrow(
      "Not authorized"
    );
  });
});

describe("logUnsubscribe", () => {
  it("sends log.unsubscribe with no params", async () => {
    mockOk(true);
    await unrealRpcClient.logUnsubscribe();
    expectMethod("log.unsubscribe");
    const call = mockFetch.mock.calls[0];
    const body = JSON.parse(call[1].body as string) as Record<string, unknown>;
    // params should be undefined (no params object sent)
    expect(body.params).toBeUndefined();
  });

  it("throws on RPC error", async () => {
    mockErr("Not subscribed");
    await expect(unrealRpcClient.logUnsubscribe()).rejects.toThrow(
      "Not subscribed"
    );
  });
});

// ===========================================================================
// RPC Utilities
// ===========================================================================

describe("rpcInfo", () => {
  it("returns RPC info object", async () => {
    const info = { version: "1.0", modules: ["rpc.user", "rpc.channel"] };
    mockOk(info);
    const result = await unrealRpcClient.rpcInfo();
    expect(result).toEqual(info);
    expectMethod("rpc.info");
  });

  it("returns null on error", async () => {
    mockErr();
    const result = await unrealRpcClient.rpcInfo();
    expect(result).toBeNull();
  });
});

describe("rpcSetIssuer", () => {
  it("sends rpc.set_issuer with issuer name", async () => {
    mockOk(true);
    await unrealRpcClient.rpcSetIssuer("portal-admin");
    expectMethod("rpc.set_issuer");
    expectParam("issuer", "portal-admin");
  });

  it("throws on RPC error", async () => {
    mockErr("Invalid issuer");
    await expect(unrealRpcClient.rpcSetIssuer("bad\nname")).rejects.toThrow(
      "Invalid issuer"
    );
  });
});

describe("rpcAddTimer", () => {
  it("sends rpc.add_timer with name, request, and interval", async () => {
    mockOk(true);
    await unrealRpcClient.rpcAddTimer(
      "stats-poll",
      { method: "stats.get", params: { object_detail_level: 1 } },
      60
    );
    expectMethod("rpc.add_timer");
    expectParam("timer_name", "stats-poll");
    expectParam("every", 60);
  });

  it("includes request method and params in body", async () => {
    mockOk(true);
    const request = { method: "stats.get", params: { object_detail_level: 2 } };
    await unrealRpcClient.rpcAddTimer("my-timer", request, 30);
    const call = mockFetch.mock.calls[0];
    const body = JSON.parse(call[1].body as string) as Record<string, unknown>;
    const params = body.params as Record<string, unknown>;
    expect(params.request).toEqual(request);
  });

  it("throws on RPC error", async () => {
    mockErr("Timer already exists");
    await expect(
      unrealRpcClient.rpcAddTimer("dup", { method: "stats.get" }, 10)
    ).rejects.toThrow("Timer already exists");
  });
});

describe("rpcDelTimer", () => {
  it("sends rpc.del_timer with timer name", async () => {
    mockOk(true);
    await unrealRpcClient.rpcDelTimer("stats-poll");
    expectMethod("rpc.del_timer");
    expectParam("timer_name", "stats-poll");
  });

  it("throws on RPC error", async () => {
    mockErr("Timer not found");
    await expect(unrealRpcClient.rpcDelTimer("missing")).rejects.toThrow(
      "Timer not found"
    );
  });
});
