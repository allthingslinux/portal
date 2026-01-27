import { describe, expect, it, vi } from "vitest";

// Mock database and auth before importing utils
vi.mock("@/db", () => ({
  db: {},
}));

vi.mock("@/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/shared/observability", () => ({
  captureError: vi.fn(),
  log: {
    error: vi.fn(),
  },
  parseError: vi.fn((error: unknown) => ({
    message: error instanceof Error ? error.message : "Unknown error",
  })),
}));

import { APIError, handleAPIError } from "@/shared/api/utils";

describe("APIError", () => {
  it("should create error with message and status", () => {
    const error = new APIError("Not found", 404);
    expect(error.message).toBe("Not found");
    expect(error.status).toBe(404);
    expect(error.name).toBe("APIError");
  });

  it("should default to status 500", () => {
    const error = new APIError("Server error");
    expect(error.status).toBe(500);
  });
});

describe("handleAPIError", () => {
  it("should handle APIError correctly", async () => {
    const error = new APIError("Not found", 404);
    const response = handleAPIError(error);

    expect(response.status).toBe(404);
    const data = (await response.json()) as { ok: boolean; error: string };
    expect(data).toEqual({
      ok: false,
      error: "Not found",
    });
  });

  it("should handle generic errors", async () => {
    const error = new Error("Something went wrong");
    const response = handleAPIError(error);

    expect(response.status).toBe(500);
    const data = (await response.json()) as { ok: boolean; error: string };
    expect(data).toEqual({
      ok: false,
      error: "Internal server error",
    });
  });
});
