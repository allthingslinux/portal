import type { Thing, WithContext } from "schema-dts";

import { getCSPNonce } from "@/lib/security/nonce";

interface JsonLdProps {
  readonly code: WithContext<Thing>;
}

const escapeJsonForHtml = (json: string): string =>
  json
    // Escape & first to avoid double-escaping in previously escaped sequences
    .replace(/&/g, "\\u0026")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");
// Note: Unicode line separators (\u2028, \u2029) are already handled by JSON.stringify

export async function JsonLd({ code }: JsonLdProps) {
  const nonce = await getCSPNonce();

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires script tag with escaped JSON content
      dangerouslySetInnerHTML={{
        __html: escapeJsonForHtml(JSON.stringify(code)),
      }}
      nonce={nonce}
      type="application/ld+json"
    />
  );
}
