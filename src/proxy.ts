import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth } from "@/auth";

// ============================================================================
// Next.js Proxy (Next.js 16+)
// ============================================================================
// Proxy runs before a request is completed and can modify the response.
// According to Next.js docs, Proxy should be used for optimistic checks like
// permission-based redirects, not as a full session management solution.
//
// Important notes:
// - Proxy should use request.headers directly (not await headers())
// - Full auth checks should still be performed in pages/route handlers
// - This provides optimistic UX but doesn't replace server-side validation

export async function proxy(request: NextRequest) {
  // Get session using Better Auth's API for optimistic validation
  // This checks the session cookie - full validation happens in pages/routes
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Optimistic redirect for unauthenticated users
  // Pages and route handlers should still perform full auth checks
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
