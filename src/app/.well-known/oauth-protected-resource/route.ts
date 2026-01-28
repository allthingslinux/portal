import { connection, NextResponse } from "next/server";

import { serverClient } from "@/auth/server-client";
import { BASE_URL } from "@/config/app";

// With cacheComponents, GET handlers are prerendered unless they opt out.
// connection() defers this handler to request time (auth/server context required).
export async function GET(): Promise<NextResponse> {
  await connection();
  const metadata = await serverClient.getProtectedResourceMetadata({
    resource: BASE_URL,
    authorization_servers: [BASE_URL],
    scopes_supported: ["openid", "profile", "email", "offline_access"],
    bearer_methods_supported: ["header"],
    resource_documentation: `${BASE_URL}/docs`,
  });

  const headers = new Headers();
  if (process.env.NODE_ENV === "development") {
    headers.set("Access-Control-Allow-Methods", "GET");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set(
      "Cache-Control",
      "public, max-age=15, stale-while-revalidate=15, stale-if-error=86400"
    );
  }

  return NextResponse.json(metadata, { headers });
}
