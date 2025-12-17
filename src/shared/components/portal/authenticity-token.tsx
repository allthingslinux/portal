"use client";

export function AuthenticityToken() {
  const token = useCsrfToken();

  return <input name="csrf_token" type="hidden" value={token} />;
}

function useCsrfToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content") ?? ""
  );
}
