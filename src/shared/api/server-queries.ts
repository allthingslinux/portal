// ============================================================================
// Server-Side Query Functions
// ============================================================================
// Server-side query functions for prefetching in Server Components
// These directly query the database instead of making HTTP requests

import "server-only";

import { and, count, desc, eq, gt, ilike, or, sql } from "drizzle-orm";

import type {
  AdminStats,
  ApiKeyListFilters,
  ApiKeyListResponse,
  OAuthClientListFilters,
  OAuthClientListResponse,
  SessionListFilters,
  SessionListResponse,
  User,
  UserListFilters,
  UserListResponse,
} from "./types";
import { db } from "@/shared/db";
import { apikey } from "@/shared/db/schema/api-keys";
import { session, user } from "@/shared/db/schema/auth";
import { oauthClient } from "@/shared/db/schema/oauth";

/**
 * Fetch users list (server-side)
 */
export async function fetchUsersServer(
  filters?: UserListFilters
): Promise<UserListResponse> {
  const role = filters?.role;
  const banned = filters?.banned;
  const search = filters?.search;
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  // Build where conditions
  const conditions: ReturnType<typeof eq | typeof or>[] = [];
  if (role) {
    conditions.push(eq(user.role, role));
  }
  if (banned !== undefined) {
    conditions.push(eq(user.banned, banned));
  }
  if (search) {
    const searchCondition = or(
      ilike(user.email, `%${search}%`),
      ilike(user.name, `%${search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const users = await db
    .select()
    .from(user)
    .where(whereClause)
    .orderBy(desc(user.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(user)
    .where(whereClause);

  const total = totalResult?.count ?? 0;

  return {
    users,
    pagination: {
      total: Number(total),
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

/**
 * Fetch sessions list (server-side)
 */
export async function fetchSessionsServer(
  filters?: SessionListFilters
): Promise<SessionListResponse> {
  const userIdParam = filters?.userId;
  const active = filters?.active;
  const limit = filters?.limit ?? 100;
  const offset = filters?.offset ?? 0;

  // Build where conditions
  const conditions: ReturnType<typeof eq | typeof gt>[] = [];
  if (userIdParam) {
    conditions.push(eq(session.userId, userIdParam));
  }
  if (active === true) {
    conditions.push(gt(session.expiresAt, new Date()));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch sessions and join with users
  const sessionsData = await db
    .select({
      session,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
    .from(session)
    .leftJoin(user, eq(session.userId, user.id))
    .where(whereClause)
    .orderBy(desc(session.createdAt))
    .limit(limit)
    .offset(offset);

  // Transform to match expected format
  const sessions = sessionsData.map((row) => ({
    ...row.session,
    user: row.user?.id ? row.user : undefined,
  }));

  return { sessions };
}

/**
 * Fetch admin statistics (server-side)
 */
export async function fetchAdminStatsServer(): Promise<AdminStats> {
  // Get user stats
  const [userStats] = await db
    .select({
      total: count(user.id),
      admins: sql<number>`COUNT(*) FILTER (WHERE ${user.role} = 'admin')`,
      staff: sql<number>`COUNT(*) FILTER (WHERE ${user.role} = 'staff')`,
      banned: sql<number>`COUNT(*) FILTER (WHERE ${user.banned} = true)`,
    })
    .from(user);

  // Get active sessions count
  const [sessionStats] = await db
    .select({
      total: count(session.id),
      active: sql<number>`COUNT(*) FILTER (WHERE ${session.expiresAt} > NOW())`,
    })
    .from(session);

  // Get API keys count
  const [apiKeyStats] = await db
    .select({
      total: count(apikey.id),
      enabled: sql<number>`COUNT(*) FILTER (WHERE ${apikey.enabled} = true)`,
    })
    .from(apikey);

  // Get OAuth clients count
  const [oauthClientStats] = await db
    .select({
      total: count(oauthClient.id),
      disabled: sql<number>`COUNT(*) FILTER (WHERE ${oauthClient.disabled} = true)`,
    })
    .from(oauthClient);

  return {
    users: {
      total: Number(userStats.total),
      admins: Number(userStats.admins),
      staff: Number(userStats.staff),
      banned: Number(userStats.banned),
      regular:
        Number(userStats.total) -
        Number(userStats.admins) -
        Number(userStats.staff),
    },
    sessions: {
      total: Number(sessionStats.total),
      active: Number(sessionStats.active),
    },
    apiKeys: {
      total: Number(apiKeyStats.total),
      enabled: Number(apiKeyStats.enabled),
    },
    oauthClients: {
      total: Number(oauthClientStats.total),
      disabled: Number(oauthClientStats.disabled),
    },
  };
}

/**
 * Fetch API keys list (server-side)
 */
export async function fetchApiKeysServer(
  filters?: ApiKeyListFilters
): Promise<ApiKeyListResponse> {
  const userIdParam = filters?.userId;
  const enabled = filters?.enabled;
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  // Build where conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (userIdParam) {
    conditions.push(eq(apikey.userId, userIdParam));
  }
  if (enabled !== undefined) {
    conditions.push(eq(apikey.enabled, enabled));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch API keys and join with users
  const apiKeysData = await db
    .select({
      apikey,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
    .from(apikey)
    .leftJoin(user, eq(apikey.userId, user.id))
    .where(whereClause)
    .orderBy(desc(apikey.createdAt))
    .limit(limit)
    .offset(offset);

  // Transform to match expected format
  const apiKeys = apiKeysData.map((row) => ({
    ...row.apikey,
    user: row.user?.id ? row.user : undefined,
  }));

  return { apiKeys };
}

/**
 * Fetch current user's profile (server-side)
 * Used for prefetching user data in Server Components to reduce loading flash
 * Returns a DTO with only necessary fields matching the API route response
 */
export async function fetchCurrentUserServer(): Promise<
  Pick<
    User,
    "id" | "name" | "email" | "image" | "role" | "emailVerified" | "createdAt"
  >
> {
  // Import here to avoid circular dependencies
  const { headers } = await import("next/headers");
  const { auth } = await import("@/features/auth/lib/auth");

  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  // DTO: Only return necessary fields, not entire user object
  const [userData] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!userData) {
    throw new Error("User not found");
  }

  return userData;
}

/**
 * Fetch OAuth clients list (server-side)
 */
export async function fetchOAuthClientsServer(
  filters?: OAuthClientListFilters
): Promise<OAuthClientListResponse> {
  const userIdParam = filters?.userId;
  const disabled = filters?.disabled;
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  // Build where conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (userIdParam) {
    conditions.push(eq(oauthClient.userId, userIdParam));
  }
  if (disabled !== undefined) {
    conditions.push(eq(oauthClient.disabled, disabled));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch OAuth clients and join with users
  const oauthClientsData = await db
    .select({
      oauthClient,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
    .from(oauthClient)
    .leftJoin(user, eq(oauthClient.userId, user.id))
    .where(whereClause)
    .orderBy(desc(oauthClient.createdAt))
    .limit(limit)
    .offset(offset);

  // Transform to match expected format
  // Note: OAuth client response uses "clients" not "oauthClients"
  // Don't expose client secret in list view (matches API route behavior)
  const clients: OAuthClientListResponse["clients"] = oauthClientsData.map(
    (row) => ({
      ...row.oauthClient,
      user: row.user?.id ? row.user : undefined,
      clientSecret: undefined as never,
    })
  );

  return { clients };
}
