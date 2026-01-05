import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

// ============================================================================
// Next.js Proxy (Next.js 16+)
// ============================================================================
// Proxy runs on Node.js runtime and can perform full session validation
// For cookie-only checks (faster but less secure), use getSessionCookie instead

export async function proxy(request: NextRequest) {
  // Get session using Better Auth's API for full validation
  // This checks the session cookie and validates it against the database
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!session) {
    // Redirect to sign-in with the original path as redirectTo parameter
    const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
    return NextResponse.redirect(
      new URL(
        `/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`,
        request.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"], // Apply proxy to /app routes
};
