import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/db";
import { registerNick } from "@/features/integrations/lib/irc/atheme/client";
import { ircIntegration } from "@/features/integrations/lib/irc/implementation";

// Mock keys and config
process.env.SKIP_ENV_VALIDATION = "true";
vi.mock("@/features/integrations/lib/irc/keys", () => ({ keys: () => ({}) }));
vi.mock("@/features/integrations/lib/irc/config", () => ({
  ircConfig: { server: "irc.mock.chat", port: 6697 },
  isIrcConfigured: () => true,
  isUnrealConfigured: () => true,
}));

// Mock DB with chainable methods
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => []),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => []),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => []),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => []),
      })),
    })),
  },
}));

// Mock Atheme
vi.mock("@/features/integrations/lib/irc/atheme/client", () => ({
  registerNick: vi.fn(),
  AthemeFaultError: class extends Error {
    code = 8;
    fault = { code: 8, message: "Fault" };
  },
}));

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  startSpan: vi.fn((_, cb) => cb()),
  captureException: vi.fn(),
}));

describe("IrcIntegration Logic", () => {
  const userId = "user-123";
  const userEmail = "test@example.com";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAccount", () => {
    it("follows the registration state machine: pending -> register -> active", async () => {
      // Arrange
      const nick = "alice";
      (db.select as any)
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => [{ email: userEmail }]),
            })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        });

      (db.insert as any).mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn(() => [
            { id: "acc-1", userId, nick, status: "pending" },
          ]),
        })),
      });

      (db.update as any).mockReturnValueOnce({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => [
              { id: "acc-1", userId, nick, status: "active" },
            ]),
          })),
        })),
      });

      // Act
      const result = await ircIntegration.createAccount(userId, { nick });

      // Assert
      expect(result.nick).toBe(nick);
      expect(result.status).toBe("active");
      expect(registerNick).toHaveBeenCalledWith(
        nick,
        expect.any(String),
        userEmail
      );
    });

    it("cleans up pending record if Atheme registration fails", async () => {
      // Arrange
      const nick = "alice";
      (db.select as any)
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => [{ email: userEmail }]),
            })),
          })),
        })
        .mockReturnValueOnce({
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn(() => []) })),
          })),
        });

      (db.insert as any).mockReturnValueOnce({
        values: vi.fn(() => ({
          returning: vi.fn(() => [
            { id: "acc-1", userId, nick, status: "pending" },
          ]),
        })),
      });

      (registerNick as any).mockRejectedValueOnce(new Error("Atheme down"));

      // Act & Assert
      await expect(
        ircIntegration.createAccount(userId, { nick })
      ).rejects.toThrow("Atheme down");
      expect(db.delete).toHaveBeenCalled();
    });
  });
});
