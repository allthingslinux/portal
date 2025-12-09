"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client instance for React
 * Use this in client components for authentication operations
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  basePath: "/api/auth",
});
