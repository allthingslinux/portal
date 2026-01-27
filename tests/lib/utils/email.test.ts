import { afterEach, describe, expect, it, vi } from "vitest";

import { sendEmail } from "@/shared/utils/email";

describe("sendEmail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should log email details in development", () => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: Suppress console.log in tests
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test content</p>",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "📧 Email would be sent:",
      expect.objectContaining({
        to: "test@example.com",
        subject: "Test Subject",
        content: "<p>Test content</p>",
      })
    );
  });

  it("should handle text content", () => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: Suppress console.log in tests
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      text: "Plain text content",
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "📧 Email would be sent:",
      expect.objectContaining({
        to: "test@example.com",
        subject: "Test Subject",
        content: "Plain text content",
      })
    );
  });
});
