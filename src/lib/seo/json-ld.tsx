import type { Thing, WithContext } from "schema-dts";

interface JsonLdProps {
  readonly code: WithContext<Thing>;
}

const escapeJsonForHtml = (json: string): string =>
  json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

export function JsonLd({ code }: JsonLdProps) {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires script tag with escaped JSON content
      dangerouslySetInnerHTML={{
        __html: escapeJsonForHtml(JSON.stringify(code)),
      }}
      type="application/ld+json"
    />
  );
}
