import type { NextRequest } from "next/server";
import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";

import { auth } from "@/auth";

// With cacheComponents, route handlers are dynamic by default.

// Type assertion needed because TypeScript doesn't infer the plugin API methods
// The oauthProvider plugin is configured, so this will work at runtime
// Wrap in async function to prevent execution during build
const handler = oauthProviderOpenIdConfigMetadata(
  auth as unknown as Parameters<typeof oauthProviderOpenIdConfigMetadata>[0]
);

export async function GET(request: NextRequest) {
  return await handler(request);
}
