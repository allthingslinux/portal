import { beforeEach, describe, expect, it, vi } from "vitest";

import { IntegrationRegistry } from "@/features/integrations/lib/integrations/core/registry";
import type {
  Integration,
  IntegrationPublicInfo,
} from "@/features/integrations/lib/integrations/core/types";

// Mock integration for testing
const createMockIntegration = (id: string, enabled = true): Integration => ({
  id,
  name: `Integration ${id}`,
  description: `Description for ${id}`,
  enabled,
  createAccount: vi.fn(),
  getAccount: vi.fn(),
  updateAccount: vi.fn(),
  deleteAccount: vi.fn(),
});

describe("IntegrationRegistry", () => {
  let registry: IntegrationRegistry;

  beforeEach(() => {
    registry = new IntegrationRegistry();
  });

  describe("register", () => {
    it("should register an integration", () => {
      const integration = createMockIntegration("test-integration");
      registry.register(integration);

      expect(registry.get("test-integration")).toBe(integration);
    });

    it("should throw error when registering duplicate integration", () => {
      const integration = createMockIntegration("test-integration");
      registry.register(integration);

      expect(() => {
        registry.register(integration);
      }).toThrow("Integration already registered: test-integration");
    });
  });

  describe("get", () => {
    it("should return integration by ID", () => {
      const integration = createMockIntegration("test-integration");
      registry.register(integration);

      const result = registry.get("test-integration");

      expect(result).toBe(integration);
    });

    it("should return null for non-existent integration", () => {
      const result = registry.get("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all registered integrations", () => {
      const integration1 = createMockIntegration("integration-1");
      const integration2 = createMockIntegration("integration-2");

      registry.register(integration1);
      registry.register(integration2);

      const all = registry.getAll();

      expect(all).toHaveLength(2);
      expect(all).toContain(integration1);
      expect(all).toContain(integration2);
    });

    it("should return empty array when no integrations registered", () => {
      const all = registry.getAll();

      expect(all).toEqual([]);
    });
  });

  describe("getEnabled", () => {
    it("should return only enabled integrations", () => {
      const enabled1 = createMockIntegration("enabled-1", true);
      const enabled2 = createMockIntegration("enabled-2", true);
      const disabled = createMockIntegration("disabled", false);

      registry.register(enabled1);
      registry.register(disabled);
      registry.register(enabled2);

      const enabled = registry.getEnabled();

      expect(enabled).toHaveLength(2);
      expect(enabled).toContain(enabled1);
      expect(enabled).toContain(enabled2);
      expect(enabled).not.toContain(disabled);
    });
  });

  describe("isEnabled", () => {
    it("should return true for enabled integration", () => {
      const integration = createMockIntegration("test", true);
      registry.register(integration);

      expect(registry.isEnabled("test")).toBe(true);
    });

    it("should return false for disabled integration", () => {
      const integration = createMockIntegration("test", false);
      registry.register(integration);

      expect(registry.isEnabled("test")).toBe(false);
    });

    it("should return false for non-existent integration", () => {
      expect(registry.isEnabled("non-existent")).toBe(false);
    });
  });

  describe("getPublicInfo", () => {
    it("should return public info for all integrations", () => {
      const integration1 = createMockIntegration("integration-1", true);
      const integration2 = createMockIntegration("integration-2", false);

      registry.register(integration1);
      registry.register(integration2);

      const publicInfo = registry.getPublicInfo();

      expect(publicInfo).toHaveLength(2);
      expect(publicInfo).toEqual<IntegrationPublicInfo[]>([
        {
          id: "integration-1",
          name: "Integration integration-1",
          description: "Description for integration-1",
          enabled: true,
        },
        {
          id: "integration-2",
          name: "Integration integration-2",
          description: "Description for integration-2",
          enabled: false,
        },
      ]);
    });

    it("should exclude private integration details", () => {
      const integration = createMockIntegration("test");
      registry.register(integration);

      const publicInfo = registry.getPublicInfo()[0];

      expect(publicInfo).not.toHaveProperty("createAccount");
      expect(publicInfo).not.toHaveProperty("getAccount");
      expect(publicInfo).toHaveProperty("id");
      expect(publicInfo).toHaveProperty("name");
      expect(publicInfo).toHaveProperty("description");
      expect(publicInfo).toHaveProperty("enabled");
    });
  });
});
