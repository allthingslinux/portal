/**
 * Property tests for GET /api/bridge/identity
 *
 * Property 11: Identity API Accepts Valid Query Parameters
 * Property 12: Identity API Response Never Contains irc_server
 * Property 13: Identity API Response Shape Completeness
 *
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

process.env.SKIP_ENV_VALIDATION = "true";

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock env to avoid full key chain; route needs BRIDGE_SERVICE_TOKEN (optional)
vi.mock("@/env", () => ({
  env: { BRIDGE_SERVICE_TOKEN: undefined },
}));

import {
  asyncProperty,
  constantFrom,
  assert as fcAssert,
  string as fcString,
  record,
  uuid,
} from "fast-check";

// Namespace-compatible aliases for fast-check usage
const fc = {
  assert: fcAssert,
  asyncProperty,
  constantFrom,
  record,
  string: fcString,
  uuid,
};

// Mock env keys before importing route (backup for modules that import env indirectly)
vi.mock("@/features/integrations/lib/xmpp/keys", () => ({ keys: () => ({}) }));
vi.mock("@/features/integrations/lib/irc/keys", () => ({ keys: () => ({}) }));
vi.mock("@portal/db/keys", () => ({ keys: () => ({}) }));
vi.mock("@/features/auth/lib/keys", () => ({ keys: () => ({}) }));
vi.mock("@/features/integrations/lib/mailcow/keys", () => ({
  keys: () => ({}),
}));

// Mock auth — requireAuth always passes
vi.mock("@portal/api/utils", async () => {
  const actual =
    await vi.importActual<typeof import("@portal/api/utils")>(
      "@portal/api/utils"
    );
  return {
    ...actual,
    requireAuth: vi.fn().mockResolvedValue(undefined),
    handleAPIError: vi.fn(actual.handleAPIError),
  };
});

// Mock DB
vi.mock("@portal/db/client", () => ({
  db: {
    select: vi.fn(),
  },
}));

import { db } from "@portal/db/client";

import { GET } from "@/app/api/bridge/identity/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a chainable drizzle-like mock that resolves to `rows` */
function mockSelect(rows: unknown[]) {
  const chain = {
    from: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  };
  chain.from.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  chain.limit.mockResolvedValue(rows);
  (db.select as ReturnType<typeof vi.fn>).mockReturnValue(chain);
  return chain;
}

/** Build a multi-call mock: each call to db.select returns the next chain */
function mockSelectSequence(...rowSets: unknown[][]) {
  let call = 0;
  (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
    const rows = rowSets[call] ?? [];
    call++;
    const chain = {
      from: vi.fn(),
      where: vi.fn(),
      limit: vi.fn(),
    };
    chain.from.mockReturnValue(chain);
    chain.where.mockReturnValue(chain);
    chain.limit.mockResolvedValue(rows);
    return chain;
  });
}

const REQUIRED_FIELDS = [
  "user_id",
  "username",
  "discord_id",
  "irc_nick",
  "irc_status",
  "xmpp_jid",
  "xmpp_username",
  "xmpp_status",
  "avatar_url",
] as const;

// ---------------------------------------------------------------------------
// Property 11: Identity API Accepts Valid Query Parameters
// Validates: Requirements 10.1, 10.5
// ---------------------------------------------------------------------------
describe("Property 11: Identity API Accepts Valid Query Parameters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("discordId param → 200 or 404, never 400", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => s.trim().length > 0),
        async (discordId) => {
          // DB returns no account → 404
          mockSelect([]);
          const req = new NextRequest(
            `http://localhost/api/bridge/identity?discordId=${encodeURIComponent(discordId)}`
          );
          const res = await GET(req);
          expect(res.status).not.toBe(400);
          expect([200, 404]).toContain(res.status);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("ircNick param → 200 or 404, never 400", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => s.trim().length > 0),
        async (ircNick) => {
          mockSelect([]);
          const req = new NextRequest(
            `http://localhost/api/bridge/identity?ircNick=${encodeURIComponent(ircNick)}`
          );
          const res = await GET(req);
          expect(res.status).not.toBe(400);
          expect([200, 404]).toContain(res.status);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("xmppJid param → 200 or 404, never 400", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 1, maxLength: 30 })
          .filter((s) => s.trim().length > 0),
        async (xmppJid) => {
          mockSelect([]);
          const req = new NextRequest(
            `http://localhost/api/bridge/identity?xmppJid=${encodeURIComponent(xmppJid)}`
          );
          const res = await GET(req);
          expect(res.status).not.toBe(400);
          expect([200, 404]).toContain(res.status);
        }
      ),
      { numRuns: 20 }
    );
  });

  it("no recognized param → HTTP 400", async () => {
    const req = new NextRequest("http://localhost/api/bridge/identity");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("ircServer-only param → HTTP 400 (not a recognized param)", async () => {
    const req = new NextRequest(
      "http://localhost/api/bridge/identity?ircServer=irc.atl.chat"
    );
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Property 12: Identity API Response Never Contains irc_server
// Validates: Requirement 10.3
// ---------------------------------------------------------------------------
describe("Property 12: Identity API Response Never Contains irc_server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("discordId lookup 200 response has no irc_server field", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          nick: fc.string({ minLength: 1, maxLength: 16 }),
          status: fc.constantFrom("active", "pending"),
          jid: fc.string({ minLength: 3, maxLength: 30 }),
          username: fc.string({ minLength: 1, maxLength: 20 }),
        }),
        async ({ userId, nick, status, jid, username }) => {
          // Sequence: discordAccount, ircAccount, xmppAccount, user (avatar)
          mockSelectSequence(
            [{ userId }],
            [{ nick, status, server: "irc.atl.chat" }],
            [{ jid, username, status }],
            [{ image: null }]
          );
          const req = new NextRequest(
            "http://localhost/api/bridge/identity?discordId=123456789"
          );
          const res = await GET(req);
          expect(res.status).toBe(200);
          const body = (await res.json()) as {
            ok: boolean;
            identity: Record<string, unknown>;
          };
          expect(body.ok).toBe(true);
          expect(body.identity).not.toHaveProperty("irc_server");
        }
      ),
      { numRuns: 20 }
    );
  });

  it("ircNick lookup 200 response has no irc_server field", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          nick: fc.string({ minLength: 1, maxLength: 16 }),
          status: fc.constantFrom("active", "pending"),
        }),
        async ({ userId, nick, status }) => {
          // Sequence: ircAccount, xmppAccount, discordAccount, user (avatar)
          mockSelectSequence(
            [{ userId, nick, status, server: "irc.atl.chat" }],
            [],
            [],
            [{ image: null }]
          );
          const req = new NextRequest(
            `http://localhost/api/bridge/identity?ircNick=${encodeURIComponent(nick)}`
          );
          const res = await GET(req);
          expect(res.status).toBe(200);
          const body = (await res.json()) as {
            ok: boolean;
            identity: Record<string, unknown>;
          };
          expect(body.ok).toBe(true);
          expect(body.identity).not.toHaveProperty("irc_server");
        }
      ),
      { numRuns: 20 }
    );
  });

  it("xmppJid lookup 200 response has no irc_server field", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          jid: fc.string({ minLength: 3, maxLength: 30 }),
          username: fc.string({ minLength: 1, maxLength: 20 }),
          status: fc.constantFrom("active", "pending"),
        }),
        async ({ userId, jid, username, status }) => {
          // Sequence: xmppAccount, ircAccount, discordAccount, user (avatar)
          mockSelectSequence(
            [{ userId, jid, username, status }],
            [],
            [],
            [{ image: null }]
          );
          const req = new NextRequest(
            `http://localhost/api/bridge/identity?xmppJid=${encodeURIComponent(jid)}`
          );
          const res = await GET(req);
          expect(res.status).toBe(200);
          const body = (await res.json()) as {
            ok: boolean;
            identity: Record<string, unknown>;
          };
          expect(body.ok).toBe(true);
          expect(body.identity).not.toHaveProperty("irc_server");
        }
      ),
      { numRuns: 20 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 13: Identity API Response Shape Completeness
// Validates: Requirement 10.6
// ---------------------------------------------------------------------------
describe("Property 13: Identity API Response Shape Completeness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("discordId 200 response contains exactly the required fields", async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (userId) => {
        mockSelectSequence([{ userId }], [], [], [{ image: null }]);
        const req = new NextRequest(
          "http://localhost/api/bridge/identity?discordId=999"
        );
        const res = await GET(req);
        expect(res.status).toBe(200);
        const body = (await res.json()) as {
          ok: boolean;
          identity: Record<string, unknown>;
        };
        for (const field of REQUIRED_FIELDS) {
          expect(body.identity).toHaveProperty(field);
        }
      }),
      { numRuns: 20 }
    );
  });

  it("ircNick 200 response contains exactly the required fields", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          nick: fc.string({ minLength: 1, maxLength: 16 }),
          status: fc.constantFrom("active", "pending"),
        }),
        async ({ userId, nick, status }) => {
          mockSelectSequence(
            [{ userId, nick, status, server: "irc.atl.chat" }],
            [],
            [],
            [{ image: null }]
          );
          const req = new NextRequest(
            `http://localhost/api/bridge/identity?ircNick=${encodeURIComponent(nick)}`
          );
          const res = await GET(req);
          expect(res.status).toBe(200);
          const body = (await res.json()) as {
            ok: boolean;
            identity: Record<string, unknown>;
          };
          for (const field of REQUIRED_FIELDS) {
            expect(body.identity).toHaveProperty(field);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it("xmppJid 200 response contains exactly the required fields", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          userId: fc.uuid(),
          jid: fc.string({ minLength: 3, maxLength: 30 }),
          username: fc.string({ minLength: 1, maxLength: 20 }),
          status: fc.constantFrom("active", "pending"),
        }),
        async ({ userId, jid, username, status }) => {
          mockSelectSequence(
            [{ userId, jid, username, status }],
            [],
            [],
            [{ image: null }]
          );
          const req = new NextRequest(
            `http://localhost/api/bridge/identity?xmppJid=${encodeURIComponent(jid)}`
          );
          const res = await GET(req);
          expect(res.status).toBe(200);
          const body = (await res.json()) as {
            ok: boolean;
            identity: Record<string, unknown>;
          };
          for (const field of REQUIRED_FIELDS) {
            expect(body.identity).toHaveProperty(field);
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
