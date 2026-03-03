import { afterEach, describe, expect, it, vi } from "vitest";

import { unrealRpcClient } from "@/features/integrations/lib/irc/unreal/client";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

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

describe("UnrealIRCd Client", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("userList", () => {
    it("fetches user list with correct payload", async () => {
      // Arrange
      const mockUsers = [{ nick: "alice", realname: "Alice" }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: "2.0", result: mockUsers, id: 1 }),
      });

      // Act
      const result = await unrealRpcClient.userList();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://mock-unreal/jsonrpc/api",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Basic "),
          }),
          body: expect.stringContaining('"method":"user.list"'),
        })
      );
    });

    it("handles errors and returns empty array", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: "Internal Server Error" } }),
      });

      // Act
      const result = await unrealRpcClient.userList();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("channelList", () => {
    it("fetches channel list", async () => {
      // Arrange
      const mockChannels = [{ name: "#allthingslinux" }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: "2.0", result: mockChannels, id: 1 }),
      });

      // Act
      const result = await unrealRpcClient.channelList();

      // Assert
      expect(result).toEqual(mockChannels);
    });

    it("handles channel list errors and returns empty array", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: "Internal Server Error" } }),
      });

      // Act
      const result = await unrealRpcClient.channelList();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("userGet", () => {
    it("fetches a single user by nick", async () => {
      // Arrange
      const mockUser = { nick: "alice", realname: "Alice" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: "2.0", result: mockUser, id: 1 }),
      });

      // Act
      const result = await unrealRpcClient.userGet("alice");

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"method":"user.get"'),
        })
      );
    });

    it("returns null on error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: "Not found" } }),
      });

      // Act
      const result = await unrealRpcClient.userGet("unknown");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("channelGet", () => {
    it("fetches a single channel by name", async () => {
      // Arrange
      const mockChannel = { name: "#test" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: "2.0", result: mockChannel, id: 1 }),
      });

      // Act
      const result = await unrealRpcClient.channelGet("#test");

      // Assert
      expect(result).toEqual(mockChannel);
    });

    it("returns null on error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: "Not found" } }),
      });

      // Act
      const result = await unrealRpcClient.channelGet("#unknown");

      // Assert
      expect(result).toBeNull();
    });
  });
});
