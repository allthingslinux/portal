import { defineRelations } from "drizzle-orm";

import { schema } from "./schema";

// ============================================================================
// Drizzle Relations v2 Configuration
// ============================================================================
// Relations define how tables are connected at the application level.
// They enable relational queries like: db.query.user.findFirst({ with: { sessions: true } })
//
// Key concepts:
// - Relations are application-level, not database-level (unlike foreign keys)
// - Relations and foreign keys can be used together but are independent
// - Relations enable type-safe relational queries with Drizzle
//
// Relationship types:
// - one(): One-to-one or many-to-one relationships (returns single object)
// - many(): One-to-many relationships (returns array)
// - through(): Many-to-many relationships via junction tables
//
// Options available:
// - from: Source column (where the relation starts)
// - to: Target column (where the relation points)
// - optional: Type-level flag (false = required, true = optional)
// - alias: Disambiguate multiple relations between same tables
// - where: Filter conditions for polymorphic relations
//
// See: https://orm.drizzle.team/docs/relations-v2

export const relations = defineRelations(schema, (r) => ({
  // User relations (one-to-many)
  // A user can have multiple sessions, accounts, passkeys, etc.
  user: {
    // User sessions (one user, many sessions)
    sessions: r.many.session({
      from: r.user.id,
      to: r.session.userId,
    }),
    // User accounts (one user, many accounts - email/password, OAuth providers, etc.)
    accounts: r.many.account({
      from: r.user.id,
      to: r.account.userId,
    }),
    // User passkeys (one user, many passkeys)
    passkeys: r.many.passkey({
      from: r.user.id,
      to: r.passkey.userId,
    }),
    // User 2FA configurations (one user, many 2FA entries)
    twoFactors: r.many.twoFactor({
      from: r.user.id,
      to: r.twoFactor.userId,
    }),
    // User API keys (one user, many API keys)
    apiKeys: r.many.apikey({
      from: r.user.id,
      to: r.apikey.userId,
    }),
    // User OAuth clients (one user, many OAuth clients they've created)
    oauthClients: r.many.oauthClient({
      from: r.user.id,
      to: r.oauthClient.userId,
    }),
    // User OAuth consents (one user, many OAuth consents they've granted)
    oauthConsents: r.many.oauthConsent({
      from: r.user.id,
      to: r.oauthConsent.userId,
    }),
    // User OAuth access tokens (one user, many access tokens)
    oauthAccessTokens: r.many.oauthAccessToken({
      from: r.user.id,
      to: r.oauthAccessToken.userId,
    }),
    // User OAuth refresh tokens (one user, many refresh tokens)
    oauthRefreshTokens: r.many.oauthRefreshToken({
      from: r.user.id,
      to: r.oauthRefreshToken.userId,
    }),
  },
  // Session relations (many-to-one)
  // A session belongs to one user and can have multiple OAuth tokens
  session: {
    // Session owner (many sessions, one user)
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
    // Session OAuth access tokens (one session, many access tokens)
    oauthAccessTokens: r.many.oauthAccessToken({
      from: r.session.id,
      to: r.oauthAccessToken.sessionId,
    }),
    // Session OAuth refresh tokens (one session, many refresh tokens)
    oauthRefreshTokens: r.many.oauthRefreshToken({
      from: r.session.id,
      to: r.oauthRefreshToken.sessionId,
    }),
  },
  // Account relations (many-to-one)
  // An account belongs to one user
  account: {
    // Account owner (many accounts, one user)
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  // Passkey relations (many-to-one)
  // A passkey belongs to one user
  passkey: {
    // Passkey owner (many passkeys, one user)
    user: r.one.user({
      from: r.passkey.userId,
      to: r.user.id,
    }),
  },
  // TwoFactor relations (many-to-one)
  // A 2FA configuration belongs to one user
  twoFactor: {
    // 2FA owner (many 2FA configs, one user)
    user: r.one.user({
      from: r.twoFactor.userId,
      to: r.user.id,
    }),
  },
  // API Key relations (many-to-one)
  // An API key belongs to one user
  apikey: {
    // API key owner (many API keys, one user)
    user: r.one.user({
      from: r.apikey.userId,
      to: r.user.id,
    }),
  },
  // OAuth Client relations (many-to-one, one-to-many)
  // An OAuth client belongs to one user and can have many consents/tokens
  oauthClient: {
    // OAuth client owner (many clients, one user)
    user: r.one.user({
      from: r.oauthClient.userId,
      to: r.user.id,
    }),
    // OAuth client consents (one client, many consents)
    oauthConsents: r.many.oauthConsent({
      from: r.oauthClient.clientId,
      to: r.oauthConsent.clientId,
    }),
    // OAuth client access tokens (one client, many access tokens)
    oauthAccessTokens: r.many.oauthAccessToken({
      from: r.oauthClient.clientId,
      to: r.oauthAccessToken.clientId,
    }),
    // OAuth client refresh tokens (one client, many refresh tokens)
    oauthRefreshTokens: r.many.oauthRefreshToken({
      from: r.oauthClient.clientId,
      to: r.oauthRefreshToken.clientId,
    }),
  },
  // OAuth Consent relations (many-to-one)
  // An OAuth consent belongs to one client and one user
  oauthConsent: {
    // Consent client (many consents, one client)
    oauthClient: r.one.oauthClient({
      from: r.oauthConsent.clientId,
      to: r.oauthClient.clientId,
    }),
    // Consent user (many consents, one user)
    user: r.one.user({
      from: r.oauthConsent.userId,
      to: r.user.id,
    }),
  },
  // OAuth Access Token relations (many-to-one, one-to-one)
  // An access token belongs to one client, one user, one session, and one refresh token
  oauthAccessToken: {
    // Access token client (many tokens, one client)
    oauthClient: r.one.oauthClient({
      from: r.oauthAccessToken.clientId,
      to: r.oauthClient.clientId,
    }),
    // Access token user (many tokens, one user)
    user: r.one.user({
      from: r.oauthAccessToken.userId,
      to: r.user.id,
    }),
    // Access token session (many tokens, one session)
    session: r.one.session({
      from: r.oauthAccessToken.sessionId,
      to: r.session.id,
    }),
    // Access token refresh token (one-to-one relationship)
    refreshToken: r.one.oauthRefreshToken({
      from: r.oauthAccessToken.refreshId,
      to: r.oauthRefreshToken.id,
    }),
  },
  // OAuth Refresh Token relations (many-to-one, one-to-many)
  // A refresh token belongs to one client, one user, one session, and can have many access tokens
  oauthRefreshToken: {
    // Refresh token client (many tokens, one client)
    oauthClient: r.one.oauthClient({
      from: r.oauthRefreshToken.clientId,
      to: r.oauthClient.clientId,
    }),
    // Refresh token user (many tokens, one user)
    user: r.one.user({
      from: r.oauthRefreshToken.userId,
      to: r.user.id,
    }),
    // Refresh token session (many tokens, one session)
    session: r.one.session({
      from: r.oauthRefreshToken.sessionId,
      to: r.session.id,
    }),
    // Refresh token access tokens (one refresh token, many access tokens)
    accessTokens: r.many.oauthAccessToken({
      from: r.oauthRefreshToken.id,
      to: r.oauthAccessToken.refreshId,
    }),
  },
}));
