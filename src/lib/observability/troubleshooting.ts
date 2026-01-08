/**
 * Troubleshooting utilities for transaction naming and data handling
 */

// Regex constants for performance
const MULTIPLE_SLASHES_PATTERN = /\/+/g;
const TRAILING_SLASH_PATTERN = /\/$/;

/**
 * Sanitize transaction names by replacing dynamic segments
 */
export const sanitizeTransactionName = (transactionName?: string): string => {
  if (!transactionName) {
    return "unknown";
  }

  return (
    transactionName
      // Replace UUIDs with placeholder (case-insensitive)
      .replace(
        /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/gi,
        "/<uuid>"
      )
      // Replace hash-like strings (32+ hex chars, case-insensitive)
      .replace(/\/[0-9a-fA-F]{32,}/gi, "/<hash>")
      // Replace numeric IDs
      .replace(/\/\d+/g, "/<id>")
      // Replace email addresses
      .replace(/\/[^/]+@[^/]+\.[^/]+/g, "/<email>")
      // Replace base64 tokens (40+ chars with = padding)
      .replace(/\/[A-Za-z0-9+/=]{40,}/g, "/<token>")
      // Replace hex tokens (32+ hex chars, case-insensitive)
      .replace(/\/[0-9a-fA-F]{32,}/gi, "/<token>")
      // Clean up multiple slashes
      .replace(MULTIPLE_SLASHES_PATTERN, "/")
      // Remove trailing slash
      .replace(TRAILING_SLASH_PATTERN, "")
  );
};

interface SpanWithAttributes {
  setAttribute?: (key: string, value: string) => void;
}

/**
 * Split long data into multiple attributes to avoid truncation
 */
export const setLongAttribute = (
  span: SpanWithAttributes,
  key: string,
  value: string,
  maxLength = 200
): void => {
  if (!span?.setAttribute) {
    return;
  }

  if (value.length <= maxLength) {
    span.setAttribute(key, value);
    return;
  }

  // Split into chunks
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += maxLength) {
    chunks.push(value.slice(i, i + maxLength));
  }

  // Set chunked attributes (setAttribute already verified by guard clause)
  chunks.forEach((chunk, index) => {
    span.setAttribute(`${key}.${index}`, chunk);
  });

  // Set metadata about the chunking
  span.setAttribute(`${key}._chunks`, chunks.length.toString());
  span.setAttribute(`${key}._total_length`, value.length.toString());
};

/**
 * Set URL attributes properly to avoid truncation
 */
export const setUrlAttributes = (
  span: SpanWithAttributes,
  url: string
): void => {
  if (!span?.setAttribute) {
    return;
  }

  try {
    const parsedUrl = new URL(url);

    span.setAttribute("http.url.base", parsedUrl.origin);
    span.setAttribute("http.url.path", parsedUrl.pathname);

    if (parsedUrl.search) {
      // Split query parameters to avoid truncation (setAttribute already verified by guard clause)
      const params = new URLSearchParams(parsedUrl.search);
      params.forEach((value, key) => {
        span.setAttribute(`http.url.query.${key}`, value);
      });
    }

    if (parsedUrl.hash) {
      span.setAttribute("http.url.fragment", parsedUrl.hash);
    }
  } catch {
    // Fallback to setting the full URL with chunking
    setLongAttribute(span, "http.url", url);
  }
};

/**
 * Initialize transaction name sanitization
 */
export const initializeTransactionSanitization = (): void => {
  try {
    const { addEventProcessor } = require("@sentry/nextjs");

    addEventProcessor((event: { transaction?: string; type?: string }) => {
      if (event.type === "transaction" && event.transaction) {
        event.transaction = sanitizeTransactionName(event.transaction);
      }
      return event;
    });
  } catch {
    // Sentry not available
  }
};
