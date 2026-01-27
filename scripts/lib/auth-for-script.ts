/**
 * Minimal Better Auth instance for scripts (create-admin, etc.).
 * Does not import "server-only" or the full auth config, so it can run under tsx.
 * Only includes what signUpEmail needs: database adapter, basePath, baseURL, secret.
 */
import "dotenv/config";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db";
import { schema } from "@/db/schema";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const secret = process.env.BETTER_AUTH_SECRET;

if (!secret) {
  throw new Error(
    "BETTER_AUTH_SECRET is required. Set it in .env or pass it when running the script."
  );
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  basePath: "/api/auth",
  baseURL,
  secret,
  emailAndPassword: {
    enabled: true,
  },
});
