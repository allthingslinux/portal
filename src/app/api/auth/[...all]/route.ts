import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/auth";

// Add CORS headers for OAuth2 endpoints in development
function addCorsHeaders(url: URL, headers: Headers) {
  if (
    process.env.NODE_ENV === "development" &&
    [
      "/api/auth/oauth2/token",
      "/api/auth/oauth2/userinfo",
      "/api/auth/oauth2/register",
    ].includes(url.pathname)
  ) {
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "authorization, content-type");
    headers.set(
      "Cache-Control",
      "public, max-age=15, stale-while-revalidate=15, stale-if-error=86400"
    );
  }
}

// CORS wrapper for Better Auth handlers
function withCors(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    const res = await handler(req);
    addCorsHeaders(new URL(req.url), res.headers);
    return res;
  };
}

// Mount Better Auth to Next.js API routes
const handler = toNextJsHandler(auth);

export const GET = withCors(handler.GET);
export const POST = withCors(handler.POST);

export function OPTIONS(req: NextRequest): NextResponse {
  const headers = new Headers();
  addCorsHeaders(new URL(req.url), headers);
  return new NextResponse(null, {
    headers,
  });
}
