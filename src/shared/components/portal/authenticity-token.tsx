"use client";

import { useCsrfToken } from "~/shared/hooks/use-csrf-token";

export function AuthenticityToken() {
  const token = useCsrfToken();

  return <input name="csrf_token" type="hidden" value={token} />;
}
