import { type NextRequest, NextResponse } from "next/server";

import pathsConfig from "~/config/paths.config";

/**
 * Auth confirm route
 * NextAuth handles email verification automatically.
 * This route is kept for backward compatibility.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const next = searchParams.get("next") || pathsConfig.app.home;

  url.pathname = next;
  url.search = "";

  return NextResponse.redirect(url);
}
