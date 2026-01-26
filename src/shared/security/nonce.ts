import { cookies } from "next/headers";

/**
 * Get CSP nonce from cookies
 * Nonces are generated per-request in middleware and stored in cookies
 * for use in Server Components and Client Components
 */
export async function getCSPNonce(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("csp-nonce")?.value;
  } catch {
    // Cookies not available (edge case)
    return undefined;
  }
}
