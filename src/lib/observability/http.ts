/**
 * HTTP request instrumentation utilities for custom HTTP clients
 */

interface HttpRequestOptions {
  method: string;
  url: string;
  requestSize?: number;
}

/**
 * Safely calculate body size, returning undefined for non-serializable bodies
 */
const calculateBodySize = (body: unknown): number | undefined => {
  try {
    return JSON.stringify(body).length;
  } catch {
    return undefined;
  }
};

/**
 * Instrument HTTP requests for custom clients
 */
export const instrumentHttpRequest = async <T>(
  options: HttpRequestOptions,
  requester: () => Promise<T>
): Promise<T> => {
  try {
    const { startSpan } = require("@sentry/nextjs");

    return await startSpan(
      {
        op: "http.client",
        name: `${options.method} ${options.url}`,
        attributes: {
          "http.request.method": options.method,
          ...(options.requestSize && {
            "http.request.body.size": options.requestSize,
          }),
        },
      },
      async (span: {
        setAttribute: (key: string, value: unknown) => void;
        setStatus: (status: { code: number; message: string }) => void;
      }) => {
        try {
          // Parse URL for server attributes
          const parsedURL = new URL(
            options.url,
            typeof window !== "undefined" ? window.location.origin : undefined
          );
          span.setAttribute("server.address", parsedURL.hostname);
          if (parsedURL.port) {
            span.setAttribute("server.port", Number(parsedURL.port));
          }

          const result = await requester();

          // If result looks like a Response object, extract status and size
          if (result && typeof result === "object" && "status" in result) {
            const response = result as {
              status: number;
              headers?: { get?: (name: string) => string | null };
            };
            span.setAttribute("http.response.status_code", response.status);

            if (response.headers?.get) {
              const contentLength = response.headers.get("content-length");
              if (contentLength) {
                span.setAttribute(
                  "http.response.body.size",
                  Number(contentLength)
                );
              }
            }
          }

          return result;
        } catch (error) {
          // Use Sentry constant for error status code
          try {
            const { SPAN_STATUS_ERROR } = require("@sentry/core");
            span.setStatus({ code: SPAN_STATUS_ERROR, message: "error" });
          } catch {
            // Fallback if @sentry/core is not available
            span.setStatus({ code: 2, message: "error" });
          }
          throw error;
        }
      }
    );
  } catch {
    // Fallback without instrumentation
    return await requester();
  }
};

/**
 * Build HTTP request options for instrumentation
 */
const buildHttpOptions = (
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: unknown
): HttpRequestOptions => ({
  method,
  url,
  ...(body !== undefined && {
    requestSize: calculateBodySize(body),
  }),
});

/**
 * Common HTTP methods with instrumentation
 */
export const httpClient = {
  get: <T>(url: string, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(buildHttpOptions("GET", url), fetcher),

  post: <T>(url: string, body: unknown, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(
      buildHttpOptions("POST", url, body),
      fetcher
    ),

  put: <T>(url: string, body: unknown, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(
      buildHttpOptions("PUT", url, body),
      fetcher
    ),

  delete: <T>(url: string, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(buildHttpOptions("DELETE", url), fetcher),
};
