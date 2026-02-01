import { describe, expect, it } from "vitest";

import {
  generateIrcPassword,
  IRC_NICK_MAX_LENGTH,
  isValidIrcNick,
} from "@/features/integrations/lib/irc/utils";

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

describe("isValidIrcNick", () => {
  it("accepts valid nicks: first char letter, rest letters/digits/specials (RFC 1459)", () => {
    expect(isValidIrcNick("alice")).toBe(true);
    expect(isValidIrcNick("Bob123")).toBe(true);
    expect(isValidIrcNick("user_name")).toBe(true);
    expect(isValidIrcNick("nick-with-dash")).toBe(true);
    expect(isValidIrcNick("a[]\\^_`{|}~")).toBe(true);
  });

  it("rejects leading digits (RFC 1459 requires first char to be letter)", () => {
    expect(isValidIrcNick("123bob")).toBe(false);
    expect(isValidIrcNick("0user")).toBe(false);
  });

  it("rejects leading/trailing spaces", () => {
    expect(isValidIrcNick("  alice")).toBe(false);
    expect(isValidIrcNick("alice  ")).toBe(false);
    expect(isValidIrcNick("  alice  ")).toBe(false);
  });

  it("rejects empty or whitespace-only", () => {
    expect(isValidIrcNick("")).toBe(false);
    expect(isValidIrcNick("   ")).toBe(false);
  });

  it("rejects null/undefined (falsy)", () => {
    expect(isValidIrcNick(null as unknown as string)).toBe(false);
    expect(isValidIrcNick(undefined as unknown as string)).toBe(false);
  });

  it("accepts single-character nick (letter)", () => {
    expect(isValidIrcNick("a")).toBe(true);
  });

  it("rejects nicks with embedded newlines", () => {
    expect(isValidIrcNick("alice\n")).toBe(false);
    expect(isValidIrcNick("alice\r\n")).toBe(false);
  });

  it("rejects non-ASCII characters", () => {
    expect(isValidIrcNick("álïçé")).toBe(false);
    expect(isValidIrcNick("用户")).toBe(false);
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
