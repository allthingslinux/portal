import { createHash } from "node:crypto";

/**
 * Convert a Better Auth user ID (text string) to a deterministic UUID.
 * This matches the logic used in the database hook to ensure consistency.
 *
 * @param userId - The Better Auth user ID (text string)
 * @returns A deterministic UUID string
 */
export function betterAuthUserIdToUuid(userId: string): string {
  // Generate a deterministic UUID from the Better Auth user ID
  // Use SHA-256 hash and format as UUID (simplified approach)
  const hash = createHash("sha256").update(userId).digest("hex");
  // Format first 32 hex chars as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const userIdUuid = [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `5${hash.slice(13, 16)}`, // Version 5 marker
    `8${hash.slice(17, 20)}`, // Variant marker
    hash.slice(20, 32),
  ].join("-");

  return userIdUuid;
}

