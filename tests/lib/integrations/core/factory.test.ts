import { beforeEach, describe, expect, it, vi } from "vitest";

import { getIntegrationOrThrow } from "@/lib/integrations/core/factory";
import { getIntegrationRegistry } from "@/lib/integrations/core/registry";
import type { Integration } from "@/lib/integrations/core/types";

// Mock the registry
vi.mock("@/lib/integrations/core/registry", () => {
  const mockRegistry = {
    get: vi.fn(),
  };

  return {
    getIntegrationRegistry: () => mockRegistry,
    IntegrationRegistry: class {
      get = mockRegistry.get;
    },
  };
});

describe("getIntegrationOrThrow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return integration when found", () => {
    const mockIntegration: Integration = {
      id: "test-integration",
      name: "Test Integration",
      description: "Test description",
      enabled: true,
      createAccount: vi.fn(),
      getAccount: vi.fn(),
      updateAccount: vi.fn(),
      deleteAccount: vi.fn(),
    };

    vi.mocked(getIntegrationRegistry().get).mockReturnValue(mockIntegration);

    const result = getIntegrationOrThrow("test-integration");

    expect(result).toBe(mockIntegration);
    expect(getIntegrationRegistry().get).toHaveBeenCalledWith(
      "test-integration"
    );
  });

  it("should throw error when integration not found", () => {
    vi.mocked(getIntegrationRegistry().get).mockReturnValue(null);

    expect(() => {
      getIntegrationOrThrow("non-existent");
    }).toThrow("Unknown integration: non-existent");

    expect(getIntegrationRegistry().get).toHaveBeenCalledWith("non-existent");
  });
});
