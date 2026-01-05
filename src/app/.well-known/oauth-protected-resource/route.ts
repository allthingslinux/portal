import { NextResponse } from "next/server";

import { serverClient } from "@/auth";

export async function GET(): Promise<NextResponse> {
  const metadata = await serverClient.getProtectedResourceMetadata({
    resource: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    authorization_servers: [
      process.env.BETTER_AUTH_URL || "http://localhost:3000",
    ],
    scopes_supported: ["openid", "profile", "email", "offline_access"],
    bearer_methods_supported: ["header"],
    resource_documentation: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/docs`,
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
