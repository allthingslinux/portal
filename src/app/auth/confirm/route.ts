import { type NextRequest, NextResponse } from "next/server";

import pathsConfig from "~/lib/config/paths.config";

/**
 * Auth confirm route
 * Better Auth handles email verification automatically via its `/api/auth` handler.
 * This route is kept for backward compatibility and simple redirects.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const next = searchParams.get("next") || pathsConfig.app.home;

  url.pathname = next;
  url.search = "";

  return NextResponse.redirect(url);
}
