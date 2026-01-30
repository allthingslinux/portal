import { describe, expect, it } from "vitest";

import {
  generateIrcPassword,
  IRC_NICK_MAX_LENGTH,
  isValidIrcNick,
} from "@/features/integrations/lib/irc/utils";

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

describe("isValidIrcNick", () => {
  it("accepts valid nicks: letters, digits, specials", () => {
    expect(isValidIrcNick("alice")).toBe(true);
    expect(isValidIrcNick("Bob123")).toBe(true);
    expect(isValidIrcNick("user_name")).toBe(true);
    expect(isValidIrcNick("nick-with-dash")).toBe(true);
    expect(isValidIrcNick("[]\\^_`{|}~")).toBe(true);
  });

  it("rejects empty or whitespace-only", () => {
    expect(isValidIrcNick("")).toBe(false);
    expect(isValidIrcNick("   ")).toBe(false);
  });

  it("rejects null/undefined (falsy)", () => {
    expect(isValidIrcNick(null as unknown as string)).toBe(false);
    expect(isValidIrcNick(undefined as unknown as string)).toBe(false);
  });

  it("trims and validates", () => {
    expect(isValidIrcNick("  alice  ")).toBe(true);
  });

  it("rejects nicks over NICKLEN (50)", () => {
    const long = "a".repeat(IRC_NICK_MAX_LENGTH + 1);
    expect(isValidIrcNick(long)).toBe(false);
  });

  it("accepts nick at exactly 50 chars", () => {
    const max = "a".repeat(IRC_NICK_MAX_LENGTH);
    expect(isValidIrcNick(max)).toBe(true);
  });

  it("rejects invalid characters (spaces, @, etc.)", () => {
    expect(isValidIrcNick("user name")).toBe(false);
    expect(isValidIrcNick("user@host")).toBe(false);
    expect(isValidIrcNick("nick!")).toBe(false);
  });
});

describe("generateIrcPassword", () => {
  it("returns a string of expected length", () => {
    const pwd = generateIrcPassword();
    expect(typeof pwd).toBe("string");
    expect(pwd.length).toBe(24);
  });

  it("returns different values on each call", () => {
    const a = generateIrcPassword();
    const b = generateIrcPassword();
    expect(a).not.toBe(b);
  });

  it("uses URL-safe base64 characters", () => {
    const pwd = generateIrcPassword();
    expect(pwd).toMatch(BASE64URL_PATTERN);
  });
});
