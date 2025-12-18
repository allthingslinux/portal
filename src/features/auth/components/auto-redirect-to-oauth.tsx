"use client";

import { useEffect } from "react";

type AutoRedirectToOAuthProps = {
  provider: string;
  returnPath: string;
};

export function AutoRedirectToOAuth({
  provider,
  returnPath,
}: AutoRedirectToOAuthProps) {
  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackURL = `${baseURL}${returnPath}`;
    const oauthUrl = `${baseURL}/api/auth/sign-in/social?provider=${provider}&callbackURL=${encodeURIComponent(callbackURL)}`;

    window.location.href = oauthUrl;
  }, [provider, returnPath]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Redirecting...</p>
    </div>
  );
}
