import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
vi.mock("@/shared/api/utils", () => ({
  requireAdminOrStaff: vi.fn(),
  handleAPIError: vi.fn((err) => new Response(err.message, { status: 500 })),
}));

describe("Admin IRC Accounts API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized if privilege check fails", async () => {
    // Arrange
    const { requireAdminOrStaff } = await import("@/shared/api/utils");
    (requireAdminOrStaff as any).mockRejectedValueOnce(
      new Error("Unauthorized")
    );
    const req = new NextRequest("http://localhost/api/admin/irc-accounts");

    // Act
    const res = await GET(req);

    // Assert
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Unauthorized");
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
});
