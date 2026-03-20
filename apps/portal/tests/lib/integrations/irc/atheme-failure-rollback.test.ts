/**
 * Property 7: Atheme Provisioning Failure Rolls Back
 *
 * For any network error or fault response from Atheme JSON-RPC, assert:
 * - No `irc_account` record remains (pending record is deleted)
 * - The caller receives an error (HTTP 500 from the route handler)
 *
 * **Validates: Requirement 5.3**
 */

process.env.SKIP_ENV_VALIDATION = "true";

import {
  asyncProperty,
  constantFrom,
  assert as fcAssert,
  string as fcString,
} from "fast-check";

// Namespace-compatible aliases for fast-check usage
const fc = { assert: fcAssert, asyncProperty, constantFrom, string: fcString };

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/integrations/lib/irc/keys", () => ({ keys: () => ({}) }));
vi.mock("@/features/integrations/lib/mailcow/keys", () => ({
  keys: () => ({}),
}));
vi.mock("@/features/integrations/lib/xmpp/keys", () => ({ keys: () => ({}) }));
vi.mock("@portal/db/keys", () => ({ keys: () => ({}) }));
vi.mock("@/features/auth/lib/keys", () => ({ keys: () => ({}) }));
vi.mock("@/features/integrations/lib/irc/config", () => ({
  ircConfig: {
    server: "irc.atl.chat",
    port: 6697,
    atheme: {
      jsonrpcUrl: "http://mock-atheme/jsonrpc",
      insecureSkipVerify: false,
    },
    unreal: {
      jsonrpcUrl: undefined,
      rpcUser: undefined,
      rpcPassword: undefined,
      insecureSkipVerify: false,
    },
  },
  isIrcConfigured: () => true,
  isUnrealConfigured: () => false,
}));

vi.mock("@sentry/nextjs", () => ({
  startSpan: vi.fn((_opts: unknown, cb: () => unknown) => cb()),
  captureException: vi.fn(),
}));

// Mock DB with chainable methods — we track delete calls
vi.mock("@portal/db/client", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/features/integrations/lib/irc/atheme/client", () => ({
  registerNick: vi.fn(),
  AthemeFaultError: class AthemeFaultError extends Error {
    code: number;
    fault: { code: number; message: string };
    constructor(fault: { code: number; message: string }) {
      super(fault.message);
      this.name = "AthemeFaultError";
      this.code = fault.code;
      this.fault = fault;
    }
  },
}));

import { db } from "@portal/db/client";

import {
  AthemeFaultError,
  registerNick,
} from "@/features/integrations/lib/irc/atheme/client";
import { IrcIntegration } from "@/features/integrations/lib/irc/implementation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_ID = "user-abc";
const USER_EMAIL = "user@example.com";
const ACCOUNT_ID = "acc-001";

/**
 * Set up DB mocks for a fresh account creation flow:
 * - resolveUserIdentity: user row with email + username (= nick)
 * - No existing active account / nick conflict
 * - No deleted account to reuse
 * - Insert returns a pending account row
 * - Delete returns successfully
 */
function setupDbMocks(nick: string) {
  let selectCall = 0;
  (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
    const call = selectCall++;
    let rows: unknown[];
    if (call === 0) {
      // resolveUserIdentity: Portal user row (IRC nick = username)
      rows = [{ email: USER_EMAIL, username: nick }];
    } else if (call === 1) {
      // ensureUserCanCreateIrcAccount: no existing active account
      rows = [];
    } else if (call === 2) {
      // ensureUserCanCreateIrcAccount: no nick conflict
      rows = [];
    } else {
      // initializePendingAccount: no deleted account to reuse
      rows = [];
    }
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

  (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([
        {
          id: ACCOUNT_ID,
          userId: USER_ID,
          nick,
          server: "irc.atl.chat",
          port: 6697,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: null,
        },
      ]),
    }),
  });

  (db.delete as ReturnType<typeof vi.fn>).mockReturnValue({
    where: vi.fn().mockResolvedValue([]),
  });
}

// ---------------------------------------------------------------------------
// Property 7: Atheme Provisioning Failure Rolls Back
// Validates: Requirement 5.3
// ---------------------------------------------------------------------------
describe("Property 7: Atheme Provisioning Failure Rolls Back", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("network error: pending irc_account is deleted and error is thrown", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Canonical Portal usernames (nick): 3–10 chars, letter + [a-zA-Z0-9_]
        fc
          .string({ minLength: 2, maxLength: 9 })
          .map((s) => `a${s.replace(/[^a-zA-Z0-9_]/g, "x")}`),
        fc
          .string({ minLength: 1, maxLength: 50 })
          .map((s) => `Network error: ${s}`),
        async (nick, errorMessage) => {
          setupDbMocks(nick);
          (registerNick as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            new Error(errorMessage)
          );

          const integration = new IrcIntegration();
          await expect(
            integration.createAccount(USER_ID, {})
          ).rejects.toThrow();

          // The pending record must have been deleted (rollback)
          expect(db.delete).toHaveBeenCalled();
        }
      ),
      { numRuns: 25 }
    );
  });

  it("Atheme fault response: pending irc_account is deleted and error is thrown", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 2, maxLength: 9 })
          .map((s) => `a${s.replace(/[^a-zA-Z0-9_]/g, "x")}`),
        // Atheme fault codes: 1,2,5,6,8,9,10,15,16
        fc.constantFrom(1, 2, 5, 6, 8, 9, 10, 15, 16),
        fc.string({ minLength: 1, maxLength: 40 }),
        async (nick, faultCode, faultMessage) => {
          setupDbMocks(nick);
          (registerNick as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            new AthemeFaultError({ code: faultCode, message: faultMessage })
          );

          const integration = new IrcIntegration();
          await expect(
            integration.createAccount(USER_ID, {})
          ).rejects.toThrow();

          // The pending record must have been deleted (rollback)
          expect(db.delete).toHaveBeenCalled();
        }
      ),
      { numRuns: 25 }
    );
  });

  it("abort/timeout error: pending irc_account is deleted and error is thrown", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc
          .string({ minLength: 2, maxLength: 9 })
          .map((s) => `a${s.replace(/[^a-zA-Z0-9_]/g, "x")}`),
        async (nick) => {
          setupDbMocks(nick);
          const abortError = new DOMException(
            "The operation was aborted",
            "AbortError"
          );
          (registerNick as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
            abortError
          );

          const integration = new IrcIntegration();
          await expect(
            integration.createAccount(USER_ID, {})
          ).rejects.toThrow();

          // The pending record must have been deleted (rollback)
          expect(db.delete).toHaveBeenCalled();
        }
      ),
      { numRuns: 10 }
    );
  });
});
