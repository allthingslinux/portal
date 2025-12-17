import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import pathsConfig from "~/config/paths.config";

/**
 * Auth callback route
 * Better Auth handles OAuth callbacks via the `/api/auth` handler.
 * This route is kept for backward compatibility (old deep links) and can host
 * additional redirect logic if needed.
 */
export async function GET(request: NextRequest) {
  // Better Auth processes the callback; we simply land users on the requested
  // destination (or home) afterward.
  const searchParams = request.nextUrl.searchParams;
  const next = searchParams.get("next") || pathsConfig.app.home;

  redirect(next);
}
