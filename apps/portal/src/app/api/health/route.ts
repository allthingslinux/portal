import { NextResponse } from "next/server";

/**
 * Health check endpoint for Docker health checks and orchestrators.
 * Returns 200 with { ok: true } when the app is running.
 *
 * @see portal/compose.yaml (healthcheck)
 * @see portal/Containerfile (HEALTHCHECK)
 */
export function GET() {
  return NextResponse.json({ ok: true });
}
