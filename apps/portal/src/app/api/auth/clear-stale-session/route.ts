import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

/**
 * Extracts all Set-Cookie header values from a Headers object.
 * Uses getSetCookie() when available (Node 18.4+), otherwise falls back to get().
 */
function getSetCookieValues(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const setCookie = headers.get("set-cookie");
  return setCookie ? [setCookie] : [];
}

/**
 * Clears a stale session (cookie exists but user was deleted, e.g. after DB wipe).
 * Calls auth.api.signOut to invalidate the session and clear cookies, then redirects to sign-in.
 *
 * Used by verifySession when it detects an orphaned session.
 */
export async function GET() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : "http://localhost:3000";

  try {
    const signOutRes = await auth.api.signOut({
      headers: requestHeaders,
      asResponse: true,
    });

    const setCookies = getSetCookieValues(signOutRes.headers);
    const res = NextResponse.redirect(new URL("/auth/sign-in", baseUrl));
    for (const c of setCookies) {
      res.headers.append("Set-Cookie", c);
    }
    return res;
  } catch {
    // If signOut fails (e.g. no session), redirect anyway to break any loop
    return NextResponse.redirect(new URL("/auth/sign-in", baseUrl));
  }
}
