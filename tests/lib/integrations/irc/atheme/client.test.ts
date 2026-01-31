import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AthemeFaultError,
  registerNick,
} from "@/features/integrations/lib/irc/atheme/client";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  startSpan: vi.fn((_, cb) => cb()),
  captureException: vi.fn(),
}));

// Mock keys and config to avoid T3-Env validation errors
process.env.SKIP_ENV_VALIDATION = "true";

vi.mock("@/features/integrations/lib/irc/keys", () => ({
  keys: () => ({}),
}));

vi.mock("@/features/integrations/lib/irc/config", () => ({
  ircConfig: {
    atheme: {
      jsonrpcUrl: "http://mock-atheme/jsonrpc",
      insecureSkipVerify: false,
    },
    server: "irc.mock.chat",
    port: 6697,
  },
  isIrcConfigured: () => true,
  isUnrealConfigured: () => true,
}));

describe("Atheme Client", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("registerNick", () => {
    it("sends correct JSON-RPC payload for registration", async () => {
      // Arrange
      const nick = "alice";
      const password = "password123";
      const email = "alice@example.com";
      const ip = "1.2.3.4";
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: "2.0", result: "Success", id: 1 }),
      });

      // Act
      await registerNick(nick, password, email, ip);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        "http://mock-atheme/jsonrpc",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "atheme.command",
            params: [
              ".",
              "",
              ip,
              "NickServ",
              "REGISTER",
              nick,
              password,
              email,
            ],
            id: 1,
          }),
        })
      );
    });

    it("throws AthemeFaultError when Atheme returns a fault", async () => {
      // Arrange
      const nick = "alice";
      const email = "alice@example.com";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          jsonrpc: "2.0",
          error: { code: 8, message: "Nick already registered" },
          id: 1,
        }),
      });

      // Act & Assert
      const act = () => registerNick(nick, "pwd", email);

      await expect(act).rejects.toThrow(AthemeFaultError);
      try {
        await act();
      } catch (err) {
        if (err instanceof AthemeFaultError) {
          expect(err.code).toBe(8);
          expect(err.message).toBe("Nick already registered");
        }
      }
    });

    it("handles generic fetch errors", async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error("Network Error"));

      // Act
      const act = registerNick("alice", "pwd", "alice@example.com");

      // Assert
      await expect(act).rejects.toThrow("Network Error");
    });
  });
});
