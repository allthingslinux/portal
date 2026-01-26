import { toast } from "sonner";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  apiKeyClient,
  jwtClient,
  lastLoginMethodClient,
  multiSessionClient,
  oneTimeTokenClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import {
  ac,
  admin as adminRole,
  staff as staffRole,
  user as userRole,
} from "./permissions";

// ============================================================================
// Type Exports
// ============================================================================

export type { Session } from "./config";

// ============================================================================
// Constants
// ============================================================================

// Base URL for the Better Auth server
// If auth server is on the same domain, this can be omitted
// If using a custom base path other than /api/auth, include the full path
// (e.g., "http://localhost:3000/custom-path/auth")
const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : undefined);

// ============================================================================
// Fetch Options Configuration
// ============================================================================
// Better Auth client uses better-fetch for making requests
// You can pass any better-fetch options here or per-function call

const fetchOptions = {
  // Global error handler for all client requests
  onError(e: { error: { status: number; message?: string } }) {
    // Handle rate limiting errors
    if (e.error.status === 429) {
      toast.error("Too many requests. Please try again later.");
    }
    // Add additional error handling as needed
    // e.error.message contains the error message
    // e.error.status contains the HTTP status code
    // e.error.statusText contains the HTTP status text
  },
  // Global success handler for all client requests
  onSuccess: (ctx: { response: Response }) => {
    // Store bearer token from response headers for API access
    // The token is sent in the "set-auth-token" header after successful sign-in
    const authToken = ctx.response.headers.get("set-auth-token");
    if (authToken) {
      localStorage.setItem("bearer_token", authToken);
    }
  },
  // Bearer token authentication configuration
  auth: {
    // Bearer token authentication type
    type: "Bearer" as const,
    // Retrieve bearer token from localStorage
    // This token is automatically included in the Authorization header for all requests
    token: () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem("bearer_token") || "";
      }
      return "";
    },
  },
  // Additional better-fetch options can be added here:
  // - baseURL: Override base URL for specific requests
  // - headers: Default headers for all requests
  // - timeout: Request timeout in milliseconds
  // - retry: Retry configuration
  // - disableSignal: Disable hook rerenders for specific calls (can also be set per-function)
};

// ============================================================================
// Plugin Configuration
// ============================================================================

const plugins = [
  passkeyClient(), // WebAuthn support - requires user gesture to trigger
  apiKeyClient(), // API key management
  jwtClient({
    // Custom JWKS path (must match server configuration if customized)
    // jwks: {
    //   jwksPath: "/.well-known/jwks.json", // Must match server jwksPath
    // },
  }), // JWT tokens for services that can't use sessions
  multiSessionClient(), // Multiple device sessions
  lastLoginMethodClient({
    // Cookie name (must match server configuration)
    // cookieName: "better-auth.last_used_login_method", // Default: "better-auth.last_used_login_method"
  }), // Track and display the last authentication method used
  oneTimeTokenClient(), // One-time tokens for cross-domain authentication
  twoFactorClient({
    // Handle 2FA redirect when user needs to verify second factor
    // onTwoFactorRedirect: () => {
    //   // Redirect to 2FA verification page
    //   window.location.href = "/auth/2fa";
    // },
  }),
  oauthProviderClient(), // OAuth provider functionality
  adminClient({
    // Access control system (must match server configuration)
    ac,
    // Custom roles with specific permissions
    roles: {
      admin: adminRole,
      staff: staffRole,
      user: userRole,
    },
  }),
];

// ============================================================================
// Client Options
// ============================================================================

const clientOptions = {
  baseURL,
  fetchOptions,
  plugins,
};

// ============================================================================
// Client Instance
// ============================================================================
// The client provides:
// - Authentication methods: signIn, signUp, signOut, updateUser, etc.
// - Hooks: useSession, useUser, etc. (React-specific, available via better-auth/react)
// - Plugin methods: admin, twoFactor, passkey, oauth2, etc.
// - Error codes: $ERROR_CODES object for error handling
//
// Example usage:
//   // Using hooks (React)
//   const { data: session, isPending, error, refetch } = authClient.useSession();
//
//   // Sign in
//   const { data, error } = await authClient.signIn.email({
//     email: "user@example.com",
//     password: "password123",
//   });
//
//   // Sign out
//   await authClient.signOut();
//
//   // Disable hook rerenders for specific calls
//   await authClient.updateUser(
//     { name: "New Name" },
//     { disableSignal: true }
//   );
//
//   // Access error codes for custom error handling
//   const errorCodes = authClient.$ERROR_CODES;
//   if (error?.code === errorCodes.USER_ALREADY_EXISTS) {
//     // Handle user already exists error
//   }
//
//   // Per-function fetch options
//   await authClient.signIn.email(
//     { email, password },
//     {
//       onSuccess: (ctx) => {
//         // Handle success
//       },
//       onError: (ctx) => {
//         // Handle error (ctx.error.message, ctx.error.status, ctx.error.statusText)
//       },
//       disableSignal: true, // Disable hook rerenders
//     }
//   );

export const authClient = createAuthClient(clientOptions);

// ============================================================================
// Type Exports
// ============================================================================

export type AuthClient = typeof authClient;
