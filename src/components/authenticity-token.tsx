"use client";

import { useCsrfToken } from "~/hooks/use-csrf-token";

export function AuthenticityToken() {
  const token = useCsrfToken();

  return <input name="csrf_token" type="hidden" value={token} />;
}
