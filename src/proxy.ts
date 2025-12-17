import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Check auth configuration - password auth is disabled, only Keycloak OAuth is enabled
// This matches your auth.config.ts setup
const shouldAutoRedirect = true; // password: false, oAuth: ["keycloak"]

export async function proxy(request: NextRequest) {
  // Only handle sign-in page
  if (request.nextUrl.pathname !== "/auth/sign-in") {
    return NextResponse.next();
  }

  // If password auth is disabled and only one OAuth provider is enabled,
  // redirect immediately to OAuth flow before any page rendering
  if (shouldAutoRedirect) {
    const provider = "keycloak"; // Only provider enabled
    const returnPath = request.nextUrl.searchParams.get("next") || "/home";

    // Build base URL from request
    const protocol = request.nextUrl.protocol;
    const host = request.headers.get("host") || "localhost:3000";
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || `${protocol}//${host}`;
    const callbackURL = `${baseURL}${returnPath}`;

    // Call Better Auth's handler directly to initiate OAuth flow
    // This ensures cookies are set correctly in the same request context
    try {
      const { auth } = await import("~/core/auth/better-auth");
      const { toNextJsHandler } = await import("better-auth/next-js");
      
      // Create a POST request to Better Auth's OAuth2 endpoint
      const authHandler = toNextJsHandler(auth);
      const authUrl = new URL(`${baseURL}/api/auth/sign-in/oauth2`);
      
      // Create a new request with POST method and body
      const authRequest = new Request(authUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Forward cookies from original request
          ...(request.headers.get("cookie") && {
            cookie: request.headers.get("cookie") || "",
          }),
          // Forward other relevant headers
          ...(request.headers.get("user-agent") && {
            "user-agent": request.headers.get("user-agent") || "",
          }),
        },
        body: JSON.stringify({
          providerId: provider,
          callbackURL,
        }),
      });

      // Call Better Auth handler
      const response = await authHandler.POST(authRequest as NextRequest);

      // If Better Auth returns a redirect, use it
      if (response instanceof Response) {
        const location = response.headers.get("location");
        if (location) {
          return NextResponse.redirect(location);
        }
        // If response has a URL in the body, try to extract it
        const data = await response.json().catch(() => null);
        if (data?.url) {
          return NextResponse.redirect(data.url);
        }
      }
    } catch (error) {
      // If handler call fails, log error but continue to fallback
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to initiate OAuth flow via Better Auth handler:", error);
      }
    }

    // Fallback: Let the page render and use client-side redirect handler
    // The RedirectHandler component will use Better Auth's client API to make POST request
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/sign-in",
    "/auth/sign-in/:path*", // Match all paths under sign-in
  ],
};
