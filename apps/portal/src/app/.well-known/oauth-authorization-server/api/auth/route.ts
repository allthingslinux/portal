import type { NextRequest } from "next/server";
import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";

import { auth } from "@/auth";

// Nested well-known path required by Better Auth's oauth-provider plugin.
// The plugin expects the metadata to be available at both:
//   /.well-known/oauth-authorization-server          (root)
//   /.well-known/oauth-authorization-server/api/auth (basePath-scoped)
// See: https://www.rfc-editor.org/rfc/rfc8414#section-3

const handler = oauthProviderAuthServerMetadata(
  auth as unknown as Parameters<typeof oauthProviderAuthServerMetadata>[0]
);

export async function GET(request: NextRequest) {
  return await handler(request);
}
