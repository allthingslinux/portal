"use client";

import { useEffect } from "react";
import { authClient } from "~/lib/auth/client";

/**
 * Client component that immediately redirects to OAuth
 * This runs on mount as a backup if proxy doesn't catch the request
 * (e.g., client-side navigation)
 * Uses Better Auth's client API to make proper POST request
 */
export function RedirectHandler({
  provider,
  returnPath,
}: {
  provider: string;
  returnPath: string;
}) {
  useEffect(() => {
    // Use Better Auth's client API to initiate OAuth flow
    // This makes a proper POST request to /api/auth/sign-in/oauth2
    const initiateOAuth = async () => {
      try {
        const result = await authClient.signIn.oauth2({
          providerId: provider,
          callbackURL: returnPath,
        });

        if (result.data?.url) {
          // Redirect to the OAuth provider URL returned by Better Auth
          window.location.replace(result.data.url);
        } else if (result.error) {
          console.error("OAuth initiation error:", result.error);
          // Fallback: redirect to sign-in page with error
          window.location.href = "/auth/sign-in?error=oauth_init_failed";
        }
      } catch (error) {
        console.error("Failed to initiate OAuth flow:", error);
        // Fallback: redirect to sign-in page with error
        window.location.href = "/auth/sign-in?error=oauth_init_failed";
      }
    };

    initiateOAuth();
  }, [provider, returnPath]);

  // Return minimal loading state (should redirect before this renders)
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground text-sm">
          Redirecting to {provider}...
        </p>
      </div>
    </div>
  );
}
