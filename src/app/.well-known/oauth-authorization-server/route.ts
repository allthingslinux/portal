import type { NextRequest } from "next/server";
import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";

import { auth } from "@/features/auth/lib/auth";

// Force dynamic rendering to avoid database access during build
export const dynamic = "force-dynamic";

// Type assertion needed because TypeScript doesn't infer the plugin API methods
// The oauthProvider plugin is configured, so this will work at runtime
// Wrap in async function to prevent execution during build
const handler = oauthProviderAuthServerMetadata(
  auth as unknown as Parameters<typeof oauthProviderAuthServerMetadata>[0]
);

export async function GET(request: NextRequest) {
  return await handler(request);
}
