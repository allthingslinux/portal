import { NextResponse } from "next/server";

import { serverClient } from "@/features/auth/lib/auth/server-client";
import { BASE_URL } from "@/shared/config/app";

// Force dynamic rendering to avoid database access during build
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
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
