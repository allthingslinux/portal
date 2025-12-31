import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Auto-redirect configuration for single OAuth provider
const SHOULD_AUTO_REDIRECT = true;
const OAUTH_PROVIDER = "keycloak";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Early return for non-auth routes
  if (pathname !== "/auth/sign-in") {
    return NextResponse.next();
  }

  // Skip auto-redirect if explicitly disabled or multiple providers
  if (!SHOULD_AUTO_REDIRECT) {
    return NextResponse.next();
  }

  try {
    // Get return path from query params or default to dashboard
    const returnPath = searchParams.get("next") || "/dashboard";
    
    // Build OAuth request URL
    const baseURL = getBaseURL(request);
    const oauthUrl = new URL("/api/auth/sign-in/oauth2", baseURL);
    
    // Create OAuth request
    const oauthRequest = new Request(oauthUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward essential headers
        ...getForwardedHeaders(request),
      },
      body: JSON.stringify({
        providerId: OAUTH_PROVIDER,
        callbackURL: returnPath,
      }),
    });

    // Import and call Better Auth handler
    const { auth } = await import("~/lib/auth");
    const { toNextJsHandler } = await import("better-auth/next-js");
    
    const authHandler = toNextJsHandler(auth);
    const response = await authHandler.POST(oauthRequest as NextRequest);

    // Handle OAuth redirect response
    if (response instanceof Response) {
      const location = response.headers.get("location");
      if (location) {
        return NextResponse.redirect(location);
      }

      // Try to extract URL from response body
      try {
        const data = await response.json();
        if (data?.url) {
          return NextResponse.redirect(data.url);
        }
      } catch {
        // Ignore JSON parsing errors
      }
    }
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === "development") {
      console.error("Proxy OAuth redirect failed:", error);
    }
  }

  // Fallback: render sign-in page normally
  return NextResponse.next();
}

// Helper functions
function getBaseURL(request: NextRequest): string {
  const protocol = request.nextUrl.protocol;
  const host = request.headers.get("host") || "localhost:3000";
  return process.env.NEXT_PUBLIC_SITE_URL || `${protocol}//${host}`;
}

function getForwardedHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  
  const cookie = request.headers.get("cookie");
  if (cookie) headers.cookie = cookie;
  
  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers["user-agent"] = userAgent;
  
  return headers;
}

// Matcher configuration - only run on auth routes
export const config = {
  matcher: [
    "/auth/sign-in",
    "/auth/sign-in/:path*",
  ],
};
