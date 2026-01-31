process.env.SKIP_ENV_VALIDATION = "true";

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock keys before anything else to avoid T3-Env validation
vi.mock("@/features/integrations/lib/xmpp/keys", () => ({
  keys: () => ({}),
}));
vi.mock("@/features/integrations/lib/irc/keys", () => ({
  keys: () => ({}),
}));
vi.mock("@/shared/db/keys", () => ({
  keys: () => ({}),
}));
vi.mock("@/features/auth/lib/keys", () => ({
  keys: () => ({}),
}));

import { db } from "@/db";
import { GET } from "@/app/api/admin/irc-accounts/route";

// Mock DB
vi.mock("@/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => []),
              })),
            })),
          })),
        })),
        where: vi.fn(() => ({
          limit: vi.fn(() => []),
        })),
      })),
    })),
  },
}));

// Mock utils
vi.mock("@/shared/api/utils", async () => {
  const actual =
    await vi.importActual<typeof import("@/shared/api/utils")>(
      "@/shared/api/utils"
    );
  return {
    ...actual,
    requireAdminOrStaff: vi.fn(),
    handleAPIError: vi.fn(actual.handleAPIError),
  };
});

describe("Admin IRC Accounts API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized if privilege check fails", async () => {
    // Arrange
    const { requireAdminOrStaff, APIError } = await import(
      "@/shared/api/utils"
    );
    (requireAdminOrStaff as any).mockRejectedValueOnce(
      new APIError("Unauthorized", 401)
    );
    const req = new NextRequest("http://localhost/api/admin/irc-accounts");

    // Act
    const res = await GET(req);
    const data = await res.json();

    // Assert
    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("fetches and returns IRC accounts with pagination", async () => {
    // Arrange
    const { requireAdminOrStaff } = await import("@/shared/api/utils");
    (requireAdminOrStaff as any).mockResolvedValueOnce({});

    // Mock first select (data)
    (db.select as any).mockReturnValueOnce({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => [
                  {
                    ircAccount: { id: "1", nick: "alice" },
                    user: { id: "u1" },
                  },
                ]),
              })),
            })),
          })),
        })),
      })),
    });

    // Mock second select (count)
    (db.select as any).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => [{ count: 1 }]),
      })),
    });

    const req = new NextRequest(
      "http://localhost/api/admin/irc-accounts?limit=10"
    );

    // Act
    const res = await GET(req);
    const data = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(data.ircAccounts).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
  });

  it("allows filtering by 'pending' status", async () => {
    // Arrange
    const { requireAdminOrStaff } = await import("@/shared/api/utils");
    (requireAdminOrStaff as any).mockResolvedValueOnce({});

    // Mock data select
    (db.select as any).mockReturnValueOnce({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => [
                  {
                    ircAccount: { id: "p1", nick: "bob", status: "pending" },
                    user: { id: "u2" },
                  },
                ]),
              })),
            })),
          })),
        })),
      })),
    });

    // Mock count select
    (db.select as any).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => [{ count: 1 }]),
      })),
    });

    const req = new NextRequest(
      "http://localhost/api/admin/irc-accounts?status=pending"
    );

    // Act
    const res = await GET(req);
    const data = await res.json();

    // Assert
    expect(res.status).toBe(200);
    expect(data.ircAccounts).toHaveLength(1);
    expect(data.ircAccounts[0].status).toBe("pending");
  });
});
