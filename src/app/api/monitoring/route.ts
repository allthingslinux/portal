import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { keys } from "@/shared/observability/keys";

/**
 * Sentry Tunnel Route Handler
 *
 * This route forwards Sentry events from the client to Sentry's ingest endpoint.
 * This bypasses ad-blockers and content security policies that might block
 * direct requests to Sentry's servers.
 *
 * The route is configured via `tunnelRoute: "/api/monitoring"` in next.config.ts.
 * When the client SDK sends events to `/api/monitoring`, this handler forwards
 * them to Sentry's actual ingest endpoint, removing the `sentry_key` from
 * query parameters which helps avoid ad-blocker detection.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/troubleshooting.md#dealing-with-ad-blockers
 */

// Mark as dynamic since we need to forward requests to external Sentry API
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const env = keys();

  // Only enable tunneling if Sentry is configured
  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    return NextResponse.json(
      { error: "Sentry DSN not configured" },
      { status: 503 }
    );
  }

  try {
    // Parse the DSN to get the Sentry organization domain and project ID
    const dsnUrl = new URL(env.NEXT_PUBLIC_SENTRY_DSN);
    const publicKey = dsnUrl.username;
    const projectId = dsnUrl.pathname.split("/")[1];
    const orgDomain = dsnUrl.hostname;

    if (!(publicKey && projectId && orgDomain)) {
      return NextResponse.json(
        { error: "Invalid Sentry DSN format" },
        { status: 500 }
      );
    }

    // Read the envelope from the request body
    const envelope = await request.text();

    // Forward the envelope to Sentry's ingest endpoint
    // Note: We remove the sentry_key from query params as it's in the DSN
    const sentryUrl = `https://${orgDomain}/api/${projectId}/envelope/`;

    const response = await fetch(sentryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "User-Agent": request.headers.get("user-agent") || "Sentry-Proxy",
      },
      body: envelope,
    });

    // Return the response from Sentry
    const responseText = await response.text();
    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "text/plain",
      },
    });
  } catch (error) {
    console.error("Sentry tunnel error:", error);
    return NextResponse.json(
      { error: "Failed to tunnel request to Sentry" },
      { status: 500 }
    );
  }
}

// Support GET for health checks (though Sentry only uses POST)
export function GET() {
  return NextResponse.json({ status: "ok", service: "sentry-tunnel" });
}
