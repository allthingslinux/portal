"use client";

import { useEffect } from "react";

type AutoRedirectToOAuthProps = {
  provider: string;
  returnPath: string;
};

/**
 * Client component that immediately redirects to OAuth provider
 * Used when password auth is disabled and only one OAuth provider is enabled
 */
export function AutoRedirectToOAuth({
  provider,
  returnPath,
}: AutoRedirectToOAuthProps) {
  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackURL = `${baseURL}${returnPath}`;
    const oauthUrl = `${baseURL}/api/auth/sign-in/social?provider=${provider}&callbackURL=${encodeURIComponent(callbackURL)}`;

    // Immediately redirect - this happens before any rendering
    window.location.href = oauthUrl;
  }, [provider, returnPath]);

  // Return minimal loading state (shouldn't be visible)
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Redirecting...</p>
    </div>
  );
}
