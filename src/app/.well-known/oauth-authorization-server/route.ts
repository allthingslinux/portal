import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";

import { auth } from "../../../lib/auth";

// Type assertion needed because TypeScript doesn't infer the plugin API methods
// The oauthProvider plugin is configured, so this will work at runtime
export const GET = oauthProviderAuthServerMetadata(
  auth as unknown as Parameters<typeof oauthProviderAuthServerMetadata>[0]
);
