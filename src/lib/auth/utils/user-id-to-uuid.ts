import { createHash } from "node:crypto";

/**
 * Convert a Better Auth user ID (text string) to a deterministic UUID.
 */
export function betterAuthUserIdToUuid(userId: string): string {
  const hash = createHash("sha256").update(userId).digest("hex");
  const userIdUuid = [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `5${hash.slice(13, 16)}`,
    `8${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join("-");

  return userIdUuid;
}
