import { oauthProvider } from "@better-auth/oauth-provider";
import { passkey } from "@better-auth/passkey";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  admin as adminPlugin,
  apiKey,
  bearer,
  jwt,
  lastLoginMethod,
  multiSession,
  oAuthProxy,
  oneTimeToken,
  openAPI,
  twoFactor,
} from "better-auth/plugins";

import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { schema } from "@/lib/db/schema";
import { xmppAccount } from "@/lib/db/schema/xmpp";
import {
  sendOTPEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "./email";
import { keys } from "./keys";
import {
  ac,
  admin as adminRole,
  staff as staffRole,
  user as userRole,
} from "./permissions";

// ============================================================================
// Constants
// ============================================================================

const env = keys();
const baseURL = env.BETTER_AUTH_URL || "http://localhost:3000";

// ============================================================================
// Database Configuration
// ============================================================================

const database = drizzleAdapter(db, {
  provider: "pg",
  schema,
});

// ============================================================================
// Email & Password Configuration
// ============================================================================

const emailAndPassword = {
  enabled: true,
  // Require email verification before allowing login (set to true in production)
  requireEmailVerification: false,
  // Disable sign up if you only want existing users to sign in
  // disableSignUp: false,
  // Password length constraints
  minPasswordLength: 8,
  maxPasswordLength: 128,
  // Path for password reset page
  resetPasswordPath: "/auth/reset-password",
  // Send password reset email (imported from ./email.ts)
  sendResetPassword: sendResetPasswordEmail,
  // Token expiration time for password reset (1 hour)
  resetPasswordTokenExpiresIn: 60 * 60,
  // Callback after password is successfully reset
  // onPasswordReset: async ({ user }, request) => {
  //   // Perform additional actions after password reset
  //   console.log(`Password reset for user ${user.email}`);
  // },
  // Custom password hashing (optional - defaults to scrypt)
  // password: {
  //   hash: customHashPassword,
  //   verify: customVerifyPassword,
  // },
};

// ============================================================================
// Email Verification Configuration
// ============================================================================

const emailVerification = {
  // Send verification email (imported from ./email.ts)
  sendVerificationEmail,
};

// ============================================================================
// Session Configuration
// ============================================================================

const session = {
  // Session expiration: 7 days (default)
  expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
  // Update session expiration when used within this time window
  updateAge: 60 * 60 * 24, // 1 day in seconds
  // Session freshness: sessions are considered "fresh" if created within this time
  // Used for sensitive operations that require recent authentication
  freshAge: 60 * 60 * 24, // 1 day in seconds (set to 0 to disable freshness check)
  // Cookie cache: stores session data in signed cookie to reduce database queries
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5 minutes cache duration
    // Strategy: "compact" (default, smallest), "jwt" (JWT compatible), or "jwe" (encrypted)
    strategy: "compact" as const,
  },
  // Store sessions in database (required for OAuth provider and session management)
  storeSessionInDatabase: true,
  // Disable automatic session refresh (set to true to prevent session expiration updates)
  // disableSessionRefresh: false,
};

// ============================================================================
// User Configuration
// ============================================================================

const user = {
  // Change email configuration
  changeEmail: {
    enabled: false, // Enable to allow users to change their email
    // sendChangeEmailConfirmation: async ({ user, newEmail, url, token }, request) => {
    //   // Send confirmation to current email before sending verification to new email
    //   await sendEmail({
    //     to: user.email,
    //     subject: "Approve email change - Portal",
    //     html: `Click the link to approve the change to ${newEmail}: ${url}`,
    //   });
    // },
    // updateEmailWithoutVerification: false, // Allow immediate update if current email is unverified
  },
  // Delete user configuration
  deleteUser: {
    enabled: true,
    // sendDeleteAccountVerification: async ({ user, url, token }, request) => {
    //   // Send verification email before account deletion
    //   await sendEmail({
    //     to: user.email,
    //     subject: "Confirm account deletion - Portal",
    //     html: `Click the link to permanently delete your account: ${url}`,
    //   });
    // },
    // beforeDelete: async (user, request) => {
    //   // Perform cleanup or additional checks before deletion
    //   // Throw APIError to prevent deletion if needed
    // },
    // afterDelete: async (user, request) => {
    //   // Perform cleanup after deletion
    // },
  },
};

// ============================================================================
// Account Configuration
// ============================================================================
// Configure account linking and management settings

const account = {
  // Account linking: allows users to link multiple authentication methods
  accountLinking: {
    enabled: true, // Enable account linking
    // trustedProviders: ["google", "github"], // Auto-link these providers even without email verification
    // allowDifferentEmails: false, // Allow linking accounts with different email addresses
    // updateUserInfoOnLink: false, // Update user info when linking new account
    // allowUnlinkingAll: false, // Allow unlinking all accounts (prevents account lockout)
  },
};

// ============================================================================
// Social Providers Configuration
// ============================================================================
// Configure OAuth providers for user authentication (Google, GitHub, etc.)
// Users can sign in with these providers using authClient.signIn.social()

const socialProviders = {
  // Example: Google OAuth
  // google: {
  //   clientId: process.env.GOOGLE_CLIENT_ID || "",
  //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  //   scope: ["email", "profile"],
  //   // For OAuth Proxy: redirectURI must be your production app's callback URL
  //   // redirectURI: "https://my-main-app.com/api/auth/callback/google",
  // },
  // Example: GitHub OAuth
  // github: {
  //   clientId: process.env.GITHUB_CLIENT_ID || "",
  //   clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  //   // For OAuth Proxy: redirectURI must be your production app's callback URL
  //   // redirectURI: "https://my-main-app.com/api/auth/callback/github",
  // },
  // Example: Discord OAuth
  // discord: {
  //   clientId: process.env.DISCORD_CLIENT_ID || "",
  //   clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
  //   // For OAuth Proxy: redirectURI must be your production app's callback URL
  //   // redirectURI: "https://my-main-app.com/api/auth/callback/discord",
  // },
};

// ============================================================================
// OAuth Provider Plugin Configuration
// ============================================================================
// Configure Better Auth to act as an OAuth provider for other applications
// This allows other apps to authenticate users via your Better Auth instance

const oauthProviderConfig = {
  // Redirect screens configuration
  loginPage: "/auth/sign-in", // Login page for OAuth authorization flow
  consentPage: "/auth/consent", // Consent page for OAuth authorization flow
  // Sign up configuration
  // signUp: {
  //   page: "/sign-up", // Sign up page for prompt=create
  //   shouldRedirect: async ({ headers }) => {
  //     // Return false to continue, or a path to redirect
  //     return false;
  //   },
  // },
  // Select account configuration
  // selectAccount: {
  //   page: "/select-account", // Account selection page
  //   shouldRedirect: async ({ headers }) => {
  //     // Return true to redirect, false to continue
  //     return false;
  //   },
  // },
  // Post login configuration (for organization-specific scopes)
  // postLogin: {
  //   page: "/select-organization", // Post login page
  //   shouldRedirect: async ({ session, scopes, headers }) => {
  //     // Return true to redirect, false to continue
  //     return false;
  //   },
  //   consentReferenceId: ({ session, scopes }) => {
  //     // Return reference ID (e.g., organization ID) for consent
  //     return undefined;
  //   },
  // },
  // Client registration
  allowDynamicClientRegistration: true, // Enable dynamic client registration (RFC7591)
  allowUnauthenticatedClientRegistration: true, // Allow unauthenticated public client registration (for MCP)
  // clientRegistrationClientSecretExpiration: "30d", // Expiration for dynamically registered confidential clients
  // clientRegistrationDefaultScopes: ["openid", "profile"], // Default scopes for new clients
  // clientRegistrationAllowedScopes: ["email", "offline_access"], // Additional allowed scopes for new clients
  // Scopes configuration
  scopes: ["openid", "profile", "email", "offline_access", "xmpp"], // Supported scopes
  // Valid audiences (resources) for this OAuth server
  validAudiences: [baseURL, `${baseURL}/api`],
  // Cached trusted clients (first-party applications)
  // cachedTrustedClients: new Set([
  //   "internal-dashboard",
  //   "mobile-app",
  // ]),
  // Client reference configuration (for organization plugin)
  // clientReference: ({ session }) => {
  //   return (session?.activeOrganizationId as string | undefined) ?? undefined;
  // },
  // Client privileges configuration
  // clientPrivileges: async ({ action, headers, user, session }) => {
  //   // Return true if user can perform action, false otherwise
  //   return true;
  // },
  // Custom claims
  // customIdTokenClaims: ({ user, scopes, metadata }) => {
  //   return {
  //     locale: "en-GB",
  //   };
  // },
  // customAccessTokenClaims: ({ user, scopes, referenceId, resource, metadata }) => {
  //   return {
  //     "https://example.com/org": referenceId,
  //     "https://example.com/roles": ["editor"],
  //   };
  // },
  customUserInfoClaims: async ({ user, scopes }) => {
    const claims: Record<string, unknown> = {};

    // Add XMPP username when 'xmpp' scope is requested
    if (scopes.includes("xmpp")) {
      const xmppAccountRecord = await db.query.xmppAccount.findFirst({
        where: eq(xmppAccount.userId, user.id),
        columns: { username: true },
      });

      if (xmppAccountRecord) {
        claims.xmpp_username = xmppAccountRecord.username;
      }
    }

    return claims;
  },
  // Token expirations
  // accessTokenExpiresIn: "1h", // Default: 1 hour
  // m2mAccessTokenExpiresIn: "1h", // Default: 1 hour (machine-to-machine)
  // idTokenExpiresIn: "10h", // Default: 10 hours
  // refreshTokenExpiresIn: "30d", // Default: 30 days
  // codeExpiresIn: "10m", // Default: 10 minutes
  // Scope-based token expirations (must be lower than defaults)
  // scopeExpirations: {
  //   "write:payments": "5m",
  //   "read:payments": "30m",
  // },
  // Storage configuration
  // storeClientSecret: "hashed", // Default: "hashed" (or "encrypted" if disableJwtPlugin: true)
  // storeTokens: "hashed", // Default: "hashed" (for refresh tokens and opaque access tokens)
  // Refresh token customization
  // formatRefreshToken: {
  //   encrypt: (token, sessionId) => {
  //     // Custom encryption logic
  //     return token;
  //   },
  //   decrypt: (token) => {
  //     // Custom decryption logic
  //     return { token };
  //   },
  // },
  // Advertised metadata (publicized scopes and claims)
  // advertisedMetadata: {
  //   scopes_supported: ["openid", "profile", "email"], // Subset of scopes
  //   claims_supported: ["https://example.com/roles"], // Additional claims (OIDC only)
  // },
  // Disable JWT plugin (opaque tokens only, HS256 id tokens)
  // disableJwtPlugin: false, // Default: false (JWT enabled by default)
  // Token prefixes (for secret scanners)
  // prefix: {
  //   opaqueAccessToken: "oat_", // Prefix for opaque access tokens
  //   refreshToken: "rt_", // Prefix for refresh tokens
  //   clientSecret: "cs_", // Prefix for client secrets
  // },
};

// ============================================================================
// Plugin Configuration
// ============================================================================

const plugins = [
  passkey({
    // Relying Party ID: unique identifier for your website based on auth server origin
    // 'localhost' is okay for local dev. Can use domain or subdomain (e.g., 'example.com' or 'www.example.com')
    // rpID: "localhost", // Defaults to baseURL hostname
    // Relying Party Name: human-readable title for your website
    // rpName: "Portal", // Defaults to appName
    // Origin URL: the origin at which your better-auth server is hosted
    // Do NOT include trailing /
    // origin: baseURL, // Defaults to baseURL
    // Authenticator selection criteria
    // authenticatorSelection: {
    //   authenticatorAttachment: "platform" | "cross-platform", // Default: not set (both allowed, platform preferred)
    //   residentKey: "required" | "preferred" | "discouraged", // Default: "preferred"
    //   userVerification: "required" | "preferred" | "discouraged", // Default: "preferred"
    // },
    // Advanced options
    // advanced: {
    //   webAuthnChallengeCookie: "better-auth-passkey", // Cookie name for WebAuthn challenge (default: "better-auth-passkey")
    // },
  }), // WebAuthn biometric authentication - requires HTTPS in production
  apiKey({
    // API key header name (default: "x-api-key")
    // apiKeyHeaders: "x-api-key", // or ["x-api-key", "xyz-api-key"] for multiple headers
    // Custom API key getter function
    // customAPIKeyGetter: (ctx) => {
    //   const has = ctx.request.headers.has("x-api-key");
    //   if (!has) return null;
    //   return ctx.request.headers.get("x-api-key");
    // },
    // Custom API key validator function
    // customAPIKeyValidator: async ({ ctx, key }) => {
    //   const res = await keyService.verify(key);
    //   return res.valid;
    // },
    // Custom key generator function
    // customKeyGenerator: (options: { length: number; prefix: string | undefined }) => {
    //   return mySuperSecretApiKeyGenerator(options.length, options.prefix);
    // },
    // Starting characters configuration
    // startingCharactersConfig: {
    //   shouldStore: true, // Whether to store starting characters (default: true)
    //   charactersLength: 6, // Length of starting characters to store (default: 6)
    // },
    // defaultKeyLength: 64, // Length of API key (default: 64, doesn't include prefix)
    // defaultPrefix: "portal_", // Default prefix (recommended to append underscore)
    // maximumPrefixLength: 20, // Maximum prefix length
    // minimumPrefixLength: 1, // Minimum prefix length
    // requireName: false, // Whether to require a name (default: false)
    // maximumNameLength: 255, // Maximum name length
    // minimumNameLength: 1, // Minimum name length
    // enableMetadata: true, // Enable metadata storage (default: true)
    // Key expiration configuration
    // keyExpiration: {
    //   defaultExpiresIn: null, // Default expiration in milliseconds (null = no expiration)
    //   disableCustomExpiresTime: false, // Disable custom expiration from client (default: false)
    //   minExpiresIn: 1, // Minimum expiration in days (default: 1)
    //   maxExpiresIn: 365, // Maximum expiration in days (default: 365)
    // },
    // Rate limiting configuration
    // rateLimit: {
    //   enabled: true, // Enable rate limiting (default: true)
    //   timeWindow: 1000 * 60 * 60 * 24, // Time window in milliseconds (default: 1 day)
    //   maxRequests: 10, // Maximum requests per window (default: 10)
    // },
    // Custom schema (if needed)
    // schema: customApiKeySchema,
    // Enable session creation from API keys (not recommended for security)
    // enableSessionForAPIKeys: false, // Default: false
    // Storage mode: "database" (default) or "secondary-storage"
    // storage: "database", // Default: "database"
    // Fallback to database when using secondary storage
    // fallbackToDatabase: false, // Default: false
    // Custom storage methods (overrides global secondaryStorage)
    // customStorage: {
    //   get: async (key) => await customStorage.get(key),
    //   set: async (key, value, ttl) => await customStorage.set(key, value, ttl),
    //   delete: async (key) => await customStorage.delete(key),
    // },
    // Defer non-critical updates to background tasks (improves latency)
    // deferUpdates: false, // Default: false (requires backgroundTasks.handler)
    // Permissions configuration
    // permissions: {
    //   defaultPermissions: {
    //     files: ["read"],
    //     users: ["read"],
    //   },
    //   // Or use a function:
    //   // defaultPermissions: async (userId, ctx) => {
    //   //   return { files: ["read"], users: ["read"] };
    //   // },
    // },
    // Disable key hashing (⚠️ NOT RECOMMENDED - security risk)
    // disableKeyHashing: false, // Default: false
  }),
  jwt({
    // JWKS configuration
    // jwks: {
    //   // Custom JWKS path (default: "/jwks")
    //   // jwksPath: "/.well-known/jwks.json",
    //   // Remote JWKS URL (disables /jwks endpoint, uses this URL for discovery)
    //   // remoteUrl: "https://example.com/.well-known/jwks.json",
    //   // Key pair algorithm configuration
    //   // keyPairConfig: {
    //   //   alg: "EdDSA", // Default: "EdDSA"
    //   //   crv: "Ed25519", // For EdDSA: "Ed25519" or "Ed448" (default: "Ed25519")
    //   //   // For RSA256/PS256: modulusLength (default: 2048)
    //   //   // For ECDH-ES: crv: "P-256" | "P-384" | "P-521" (default: "P-256")
    //   // },
    //   // Disable private key encryption (NOT RECOMMENDED - security risk)
    //   // disablePrivateKeyEncryption: false, // Default: false (encrypted with AES256 GCM)
    //   // Key rotation configuration
    //   // rotationInterval: 60 * 60 * 24 * 30, // Rotate keys every 30 days (in seconds)
    //   // gracePeriod: 60 * 60 * 24 * 30, // Keep old keys valid for 30 days after rotation (default: 30 days)
    //   // Custom adapter for JWKS storage (overrides default database storage)
    //   // adapter: {
    //   //   getJwks: async (ctx) => await customStorage.getAllKeys(),
    //   //   createJwk: async (ctx, webKey) => await customStorage.createKey(webKey),
    //   // },
    // },
    // JWT configuration
    // jwt: {
    //   // Custom payload definition
    //   // definePayload: ({ user }) => {
    //   //   return {
    //   //     id: user.id,
    //   //     email: user.email,
    //   //     role: user.role,
    //   //   };
    //   // },
    //   // Issuer (defaults to baseURL)
    //   // issuer: "https://example.com",
    //   // Audience (defaults to baseURL)
    //   // audience: "https://example.com",
    //   // Expiration time (default: "15m")
    //   // expirationTime: "1h",
    //   // Custom subject (default: user id)
    //   // getSubject: (session) => session.user.email,
    //   // Custom signing function (advanced - requires remoteUrl to be set)
    //   // sign: async (jwtPayload) => {
    //   //   // Custom signing implementation
    //   //   return signedJwt;
    //   // },
    // },
    // Disable setting JWT header (required for OAuth provider mode)
    // When using oauthProvider plugin, set this to true to disable JWT header in /oauth2/userinfo
    disableSettingJwtHeader: true, // Required for OAuth provider mode
  }), // JWT tokens for services that can't use sessions
  openAPI(),
  oAuthProxy({
    // Production URL of your main app
    // If this matches baseURL, requests will not be proxied
    // Defaults to BETTER_AUTH_URL environment variable
    productionURL: baseURL,
    // Current URL of the application (optional)
    // Automatically inferred from request URL, hosting provider, or baseURL
    // Only specify if URL isn't inferred correctly
    // currentURL: "http://localhost:3000",
    // Maximum age in seconds for encrypted cookie payloads (default: 60)
    // Payloads older than this will be rejected to prevent replay attacks
    // Keep this value short (30-60 seconds) to minimize replay attack window
    // maxAge: 60,
  }), // Proxy OAuth requests for development and preview deployments
  multiSession({
    // Maximum number of sessions a user can have per device (default: 5)
    // When this limit is reached, the oldest session will be revoked
    // maximumSessions: 5,
  }), // Multiple active sessions across different accounts
  bearer({
    // Require the token to be signed (default: false)
    // requireSignature: false,
  }), // Bearer token authentication for API requests
  oneTimeToken({
    // Disable client-side token generation (default: false)
    // If true, tokens can only be generated on the server side
    // disableClientRequest: false,
    // Token expiration time in minutes (default: 3)
    // expiresIn: 3,
    // Custom token generator function
    // generateToken: async (session, ctx) => {
    //   // Custom token generation logic
    //   return customToken;
    // },
    // Token storage configuration
    // storeToken: "plain", // Default: "plain" (stored as plain text)
    // storeToken: "hashed", // Use built-in hasher
    // storeToken: {
    //   type: "custom-hasher",
    //   hash: async (token) => {
    //     return myCustomHasher(token);
    //   },
    // },
  }), // Single-use tokens for cross-domain authentication
  twoFactor({
    // Issuer name for TOTP (shown in authenticator apps)
    // Defaults to appName if not provided
    // issuer: "Portal",
    // Skip verification when enabling 2FA (not recommended)
    // skipVerificationOnEnable: false,
    // TOTP configuration
    // totpOptions: {
    //   digits: 6, // Number of digits in TOTP code (default: 6)
    //   period: 30, // Period in seconds (default: 30)
    // },
    // OTP configuration
    otpOptions: {
      sendOTP: sendOTPEmail, // Send OTP via email
      // period: 3, // OTP validity period in minutes (default: 3)
      // storeOTP: "plain", // Storage method: "plain", "encrypted", or "hashed" (default: "plain")
    },
    // Backup codes configuration
    // backupCodesOptions: {
    //   amount: 10, // Number of backup codes to generate (default: 10)
    //   length: 10, // Length of each backup code (default: 10)
    //   storeBackupCodes: "plain", // Storage method: "plain" or "encrypted" (default: "plain")
    // },
  }),
  lastLoginMethod({
    // Cookie configuration
    // cookieName: "better-auth.last_used_login_method", // Default: "better-auth.last_used_login_method"
    // maxAge: 60 * 60 * 24 * 30, // Default: 30 days in seconds (2592000)
    // Database persistence (adds lastLoginMethod field to user table)
    // storeInDatabase: false, // Default: false
    // Custom method resolution function
    // customResolveMethod: (ctx) => {
    //   // Custom logic to determine the login method
    //   // Return null to use default resolution
    //   if (ctx.path === "/saml/callback") {
    //     return "saml";
    //   }
    //   return null;
    // },
    // Schema customization (when storeInDatabase is true)
    // schema: {
    //   user: {
    //     lastLoginMethod: "last_auth_method", // Custom field name
    //   },
    // },
  }), // Track and display the last authentication method used
  oauthProvider(oauthProviderConfig),
  adminPlugin({
    // Access control system with custom permissions
    ac,
    // Default role for new users (default: "user")
    defaultRole: "user",
    // Note: adminRoles is not needed when using custom access control (ac and roles)
    // When using custom access control, roles have exactly the permissions you grant them
    // Custom roles with specific permissions
    roles: {
      admin: adminRole,
      staff: staffRole,
      user: userRole,
    },
    // Array of user IDs that should be considered as admin (default: [])
    // Users in this list can perform any admin operation regardless of role
    // adminUserIds: ["user_id_1", "user_id_2"],
    // Duration of impersonation session in seconds (default: 1 hour = 3600)
    // impersonationSessionDuration: 60 * 60, // 1 hour
    // Default ban reason when banning a user (default: "No reason")
    defaultBanReason: "Violation of terms of service",
    // Default ban expiration in seconds (default: undefined = never expires)
    // Set to a number to make bans temporary
    defaultBanExpiresIn: 60 * 60 * 24 * 7, // 1 week
    // Message shown when a banned user tries to sign in
    // Default: "You have been banned from this application. Please contact support if you believe this is an error."
    bannedUserMessage:
      "Your account has been suspended. Contact support for assistance.",
    // Whether to allow impersonating other admin users (default: false)
    // Set to true to allow admins to impersonate other admins
    allowImpersonatingAdmins: false,
  }),
  nextCookies(),
];

// ============================================================================
// Verification Configuration
// ============================================================================

const verification = {
  // Disable automatic cleanup of expired verification tokens
  // disableCleanup: false, // Default: false (cleanup enabled)
};

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const rateLimit = {
  // Enable rate limiting (defaults: true in production, false in development)
  // enabled: true,
  // Time window in seconds for rate limiting (default: 10)
  // window: 10,
  // Maximum number of requests allowed within the window (default: 100)
  // max: 100,
  // Custom rate limit rules for specific paths
  // customRules: {
  //   "/sign-in/email": {
  //     window: 60, // 1 minute
  //     max: 5, // 5 requests per minute
  //   },
  // },
  // Storage: "memory" | "database" | "secondary-storage" (default: "memory")
  // If secondary storage is provided, rate limiting will use it
  // storage: "memory",
  // Table name for rate limiting if database is used (default: "rateLimit")
  // modelName: "rateLimit",
};

// ============================================================================
// Logger Configuration
// ============================================================================

const logger = {
  // Disable all logging (default: false)
  // disabled: false,
  // Disable colors in log output (default: determined by terminal)
  // disableColors: false,
  // Minimum log level: "info" | "warn" | "error" | "debug" (default: "error")
  // level: "error",
  // Custom logging function
  // log: (level, message, ...args) => {
  //   // Custom logging implementation
  //   console.log(`[${level}] ${message}`, ...args);
  // },
};

// ============================================================================
// Advanced Configuration
// ============================================================================

const advanced = {
  // Cookie prefix for all Better Auth cookies
  cookiePrefix: "portal",
  // IP address configuration
  // ipAddress: {
  //   // Headers to check for client IP address
  //   ipAddressHeaders: ["x-client-ip", "x-forwarded-for"],
  //   // Disable IP tracking (default: false)
  //   disableIpTracking: false,
  // },
  // Use secure cookies (HTTPS only) (default: false)
  // useSecureCookies: true,
  // Disable CSRF check (⚠️ security risk - not recommended)
  // disableCSRFCheck: false,
  // Cross-subdomain cookie configuration
  // crossSubDomainCookies: {
  //   enabled: true,
  //   domain: "example.com",
  //   additionalCookies: ["custom_cookie"],
  // },
  // Customize cookie names and attributes
  // cookies: {
  //   session_token: {
  //     name: "custom_session_token",
  //     attributes: {
  //       httpOnly: true,
  //       secure: true,
  //       sameSite: "lax",
  //     },
  //   },
  // },
  // Default cookie attributes for all cookies
  // defaultCookieAttributes: {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "lax",
  // },
  // Database configuration
  database: {
    // Custom ID generator, false to disable, "serial" for auto-increment, "uuid" for UUID
    // generateId: false | "serial" | "uuid" | ((options) => string),
    // Default limit for findMany queries (default: 100)
    // defaultFindManyLimit: 100,
    // Enable experimental joins support (requires drizzle-orm beta)
    experimentalJoins: false, // Disabled until drizzle-orm beta is supported
  },
};

// ============================================================================
// API Error Handling Configuration
// ============================================================================

const onAPIError = {
  // Throw errors instead of returning error responses (default: false)
  // throw: false,
  // Custom error handler
  // onError: (error, ctx) => {
  //   // Custom error handling logic
  //   console.error("Auth error:", error);
  // },
  // URL to redirect to on error (default: "/api/auth/error")
  // errorURL: "/auth/error",
  // Customize the default error page
  // customizeDefaultErrorPage: {
  //   colors: {
  //     background: "#ffffff",
  //     foreground: "#000000",
  //     primary: "#0070f3",
  //     primaryForeground: "#ffffff",
  //     mutedForeground: "#666666",
  //     border: "#e0e0e0",
  //     destructive: "#ef4444",
  //     titleBorder: "#0070f3",
  //     titleColor: "#000000",
  //     gridColor: "#f0f0f0",
  //     cardBackground: "#ffffff",
  //     cornerBorder: "#0070f3",
  //   },
  //   size: {
  //     radiusSm: "0.25rem",
  //     radiusMd: "0.5rem",
  //     radiusLg: "1rem",
  //     textSm: "0.875rem",
  //     text2xl: "1.5rem",
  //     text4xl: "2.25rem",
  //     text6xl: "3.75rem",
  //   },
  //   font: {
  //     defaultFamily: "system-ui, sans-serif",
  //     monoFamily: "monospace",
  //   },
  //   disableTitleBorder: false,
  //   disableCornerDecorations: false,
  //   disableBackgroundGrid: false,
  // },
};

// ============================================================================
// Database Hooks Configuration
// ============================================================================

const databaseHooks = {
  // User lifecycle hooks
  // user: {
  //   create: {
  //     before: async (user) => {
  //       // Modify user data before creation
  //       return { data: { ...user, customField: "value" } };
  //     },
  //     after: async (user) => {
  //       // Perform actions after user creation
  //     },
  //   },
  //   update: {
  //     before: async (userData) => {
  //       // Modify user data before update
  //       return { data: { ...userData, updatedAt: new Date() } };
  //     },
  //     after: async (user) => {
  //       // Perform actions after user update
  //     },
  //   },
  // },
  // Session lifecycle hooks
  // session: {
  //   create: {
  //     before: async (session) => {
  //       return { data: session };
  //     },
  //     after: async (session) => {
  //       // Perform actions after session creation
  //     },
  //   },
  // },
  // Account lifecycle hooks
  // account: {
  //   create: {
  //     before: async (account) => {
  //       return { data: account };
  //     },
  //     after: async (account) => {
  //       // Perform actions after account creation
  //     },
  //   },
  // },
  // Verification lifecycle hooks
  // verification: {
  //   create: {
  //     before: async (verification) => {
  //       return { data: verification };
  //     },
  //   },
  // },
};

// ============================================================================
// Hooks Configuration
// ============================================================================
// Request lifecycle hooks for Better Auth
// To use hooks, import createAuthMiddleware: import { createAuthMiddleware } from "better-auth/api";

const hooks = {
  // Request lifecycle hooks
  // before: createAuthMiddleware(async (ctx) => {
  //   // Execute before processing the request
  //   console.log("Request path:", ctx.path);
  // }),
  // after: createAuthMiddleware(async (ctx) => {
  //   // Execute after processing the request
  //   console.log("Response:", ctx.context.returned);
  // }),
};

// ============================================================================
// Telemetry Configuration
// ============================================================================

const telemetry = {
  // Enable or disable Better Auth's telemetry collection (default: false)
  enabled: false,
};

// ============================================================================
// Trusted Origins Configuration
// ============================================================================

const trustedOrigins = [
  "http://localhost:3000",
  // Add production origins
  // "https://portal.example.com",
  // Wildcard support for subdomains
  // "https://*.example.com",
  // Dynamic origins (function)
  // async (request) => {
  //   if (!request) {
  //     return ["https://my-frontend.com"];
  //   }
  //   // Dynamic logic based on request
  //   return ["https://dynamic-origin.com"];
  // },
];

// ============================================================================
// Auth Options
// ============================================================================

const authOptions = {
  // Application name (used in emails, OAuth, etc.)
  appName: "Portal",
  // Base URL for Better Auth (defaults to BETTER_AUTH_URL env var or inferred from request)
  baseURL,
  // Base path for Better Auth routes (default: "/api/auth")
  // basePath: "/api/auth",
  // Secret for encryption, signing, and hashing (defaults to BETTER_AUTH_SECRET or AUTH_SECRET env var)
  secret: env.BETTER_AUTH_SECRET,
  // Database adapter configuration
  database,
  // Email and password authentication
  emailAndPassword,
  // Email verification configuration
  emailVerification,
  // Session configuration
  session,
  // User configuration
  user,
  // Account configuration
  account,
  // Verification configuration
  verification,
  // Social providers (OAuth)
  socialProviders,
  // Rate limiting configuration
  rateLimit,
  // Logger configuration
  logger,
  // Advanced configuration options
  advanced,
  // Trusted origins for CORS and CSRF protection
  trustedOrigins,
  // API error handling
  onAPIError,
  // Database lifecycle hooks
  databaseHooks,
  // Request lifecycle hooks
  hooks,
  // Telemetry collection
  telemetry,
  // Disable specific auth paths
  disabledPaths: ["/token"], // Disabled because OAuth provider handles token endpoint
  // Experimental features
  experimental: {
    joins: false, // Disabled until drizzle-orm beta is supported
  },
  // Plugins
  plugins,
} as BetterAuthOptions;

// ============================================================================
// Auth Instance
// ============================================================================

export const auth = betterAuth(authOptions);

// ============================================================================
// Type Exports
// ============================================================================

export type Session = typeof auth.$Infer.Session;
