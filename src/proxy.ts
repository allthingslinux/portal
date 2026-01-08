import { randomBytes } from "node:crypto";
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

/**
 * Generate a cryptographically secure random nonce for CSP
 */
function generateNonce(): string {
  return randomBytes(16).toString("base64");
}

/**
 * Build CSP header value with nonce support
 * Note: Currently kept in Report-Only mode until all inline scripts/styles are migrated to use nonces
 */
function buildCSPHeader(nonce: string, sentryOrgDomain?: string): string {
  // Use strict-dynamic with nonce - allows scripts with nonce and scripts they load
  const scriptSrc = `'self' 'nonce-${nonce}' 'strict-dynamic' https://js.sentry-cdn.com`;
  const styleSrc = `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  // Connect-src for API calls and Sentry
  const connectSrc = sentryOrgDomain
    ? `'self' https://${sentryOrgDomain} https://js.sentry-cdn.com`
    : `'self'`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src 'self' data: https:`,
    `font-src 'self' data:`,
    `connect-src ${connectSrc}`,
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  // Generate CSP nonce for this request (used for all routes)
  const nonce = generateNonce();

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
    const redirectResponse = NextResponse.redirect(
      new URL(
        `/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`,
        request.url
      )
    );

    // Add CSP nonce to redirect response as well
    addCSPNonceToResponse(redirectResponse, nonce);
    return redirectResponse;
  }

  // Create response for authenticated requests
  const response = NextResponse.next();

  // Add CSP nonce to response
  addCSPNonceToResponse(response, nonce);

  return response;
}

/**
 * Add CSP nonce and headers to a response
 */
function addCSPNonceToResponse(response: NextResponse, nonce: string): void {
  // Add nonce to response headers so components can access it
  // Server components can read from headers(), client components from cookies
  response.headers.set("x-csp-nonce", nonce);

  // Also set it as a cookie so client-side code can access it for inline scripts
  response.cookies.set("csp-nonce", nonce, {
    httpOnly: false, // Allow client-side access for inline scripts
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });

  // Build CSP header with nonce
  // Note: Get Sentry org domain from DSN if available
  let sentryOrgDomain: string | undefined;
  try {
    const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
      const dsnUrl = new URL(sentryDsn);
      sentryOrgDomain = dsnUrl.hostname;
    }
  } catch {
    // Ignore DSN parsing errors
  }

  const cspHeader = buildCSPHeader(nonce, sentryOrgDomain);

  // Set CSP as Report-Only for now until all inline scripts/styles are migrated to nonces
  // TODO: Switch to Content-Security-Policy (enforcing) after full nonce migration
  response.headers.set("Content-Security-Policy-Report-Only", cspHeader);
}

export const config = {
  // Optimized matcher: Only run proxy on /app routes, excluding:
  // - Next.js internals (_next/*)
  // - Static files (images, fonts, CSS, JS, etc.)
  // - API routes (handled separately by route handlers)
  // - Prefetch requests (from next/link)
  matcher: [
    {
      // Match /app routes but exclude static files and Next.js internals
      source:
        "/app/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
