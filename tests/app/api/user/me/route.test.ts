import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock env.ts first to prevent all keys from loading
vi.mock("@/env", () => ({
  env: {},
}));

// Mock auth keys and config to prevent server-only env access
vi.mock("@/lib/auth/keys", () => ({
  keys: () => ({}),
}));

vi.mock("@/lib/auth/config", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
  authClient: {},
}));

// Mock XMPP integration modules to prevent server-only env access
vi.mock("@/lib/integrations/xmpp/keys", () => ({
  keys: () => ({}),
}));

vi.mock("@/lib/integrations/xmpp/config", () => ({
  xmppConfig: {},
  isXmppConfigured: () => false,
  // biome-ignore lint/suspicious/noEmptyBlockStatements: Suppress empty block in tests
  validateXmppConfig: () => {},
}));

vi.mock("@/lib/integrations/xmpp/client", () => ({
  checkProsodyAccountExists: vi.fn(),
  createProsodyAccount: vi.fn(),
  deleteProsodyAccount: vi.fn(),
  ProsodyAccountNotFoundError: class extends Error {},
}));

vi.mock("@/lib/integrations/xmpp", () => ({
  registerXmppIntegration: vi.fn(),
}));

vi.mock("@/lib/integrations", () => ({
  registerIntegrations: vi.fn(),
}));

// Mock db client and its dependencies before any imports that use them
// This prevents the relations file from trying to access schema properties
vi.mock("@/lib/db/client", () => ({
  db: {},
}));

vi.mock("@/lib/db/relations", () => ({
  relations: {},
}));

vi.mock("@/lib/db/schema/auth", () => ({
  user: {
    id: "id",
    name: "name",
    email: "email",
    image: "image",
    role: "role",
    emailVerified: "emailVerified",
    createdAt: "createdAt",
  },
  session: {
    id: "id",
    userId: "userId",
  },
  account: {
    id: "id",
    userId: "userId",
  },
  verification: {},
  passkey: {
    id: "id",
    userId: "userId",
  },
  twoFactor: {
    id: "id",
    userId: "userId",
  },
}));

vi.mock("@/lib/db/schema/api-keys", () => ({
  apikey: {
    id: "id",
    userId: "userId",
  },
  jwks: {},
}));

vi.mock("@/lib/db/schema/oauth", () => ({
  oauthClient: {
    id: "id",
    clientId: "clientId",
    userId: "userId",
  },
  oauthConsent: {
    id: "id",
    clientId: "clientId",
    userId: "userId",
  },
  oauthAccessToken: {
    id: "id",
    clientId: "clientId",
    userId: "userId",
    sessionId: "sessionId",
    refreshId: "refreshId",
  },
  oauthRefreshToken: {
    id: "id",
    clientId: "clientId",
    userId: "userId",
    sessionId: "sessionId",
  },
}));

vi.mock("@/lib/db/schema/integrations/base", () => ({
  integrationAccount: {},
}));

vi.mock("@/lib/db/schema/xmpp", () => ({
  xmppAccount: {},
}));

vi.mock("@/lib/db/schema", () => ({
  schema: {},
}));

const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: () => mockSelect(),
  },
  schema: {},
  relations: {},
}));

const mockRequireAuth = vi.fn();
const mockHandleAPIError = vi.fn();

vi.mock("@/lib/api/utils", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/api/utils")>("@/lib/api/utils");
  return {
    ...actual,
    requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
    handleAPIError: (...args: unknown[]) => mockHandleAPIError(...args),
  };
});

import { APIError } from "@/lib/api/utils";
import { GET } from "@/app/api/user/me/route";

describe("GET /api/user/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({
      from: mockFrom,
    });
    mockFrom.mockReturnValue({
      where: mockWhere,
    });
    mockWhere.mockReturnValue({
      limit: mockLimit,
    });
  });

  it("should return user data for authenticated user", async () => {
    mockRequireAuth.mockResolvedValue({
      userId: "user-1",
      session: {} as never,
    });

    mockLimit.mockResolvedValue([
      {
        id: "user-1",
        name: "Test User",
        email: "test@example.com",
        image: null,
        role: "user",
        emailVerified: true,
        createdAt: new Date("2024-01-01"),
      },
    ]);

    const request = new NextRequest("http://localhost/api/user/me", {
      headers: {
        cookie: "session=valid-session",
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty("user");
    expect(data.user).toMatchObject({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      emailVerified: true,
    });
    expect(mockRequireAuth).toHaveBeenCalledWith(request);
  });

  it("should return 404 when user is not found", async () => {
    mockRequireAuth.mockResolvedValue({
      userId: "user-1",
      session: {} as never,
    });

    mockLimit.mockResolvedValue([]);

    const request = new NextRequest("http://localhost/api/user/me");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      ok: false,
      error: "User not found",
    });
  });

  it("should handle authentication errors", async () => {
    const authError = new APIError("Unauthorized", 401);
    mockRequireAuth.mockRejectedValue(authError);
    mockHandleAPIError.mockReturnValue(
      Response.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    );

    const request = new NextRequest("http://localhost/api/user/me");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      ok: false,
      error: "Unauthorized",
    });
    expect(mockHandleAPIError).toHaveBeenCalledWith(authError);
  });

  it("should handle database errors", async () => {
    mockRequireAuth.mockResolvedValue({
      userId: "user-1",
      session: {} as never,
    });

    mockSelect.mockImplementation(() => {
      throw new Error("Database error");
    });

    mockHandleAPIError.mockReturnValue(
      Response.json(
        { ok: false, error: "Internal server error" },
        { status: 500 }
      )
    );

    const request = new NextRequest("http://localhost/api/user/me");

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      ok: false,
      error: "Internal server error",
    });
    expect(mockHandleAPIError).toHaveBeenCalled();
  });
});
