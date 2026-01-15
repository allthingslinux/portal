/**
 * HTTP request instrumentation utilities for custom HTTP clients
 */

import type { Span } from "@sentry/nextjs";
import { startSpan } from "@sentry/nextjs";

interface HttpRequestOptions {
  method: string;
  url: string;
  requestSize?: number;
}

/**
 * Instrument HTTP requests for custom clients
 */
export const instrumentHttpRequest = async <T>(
  options: HttpRequestOptions,
  requester: () => Promise<T>
): Promise<T> => {
  try {
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
      async (span: Span) => {
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
          // Use OpenTelemetry span status code for error (2 = ERROR)
          span.setStatus({ code: 2, message: "error" });
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
 * Safely calculate the size of a request body by stringifying it
 * @param body - The request body to measure
 * @returns The size in bytes, or undefined if serialization fails
 */
const calculateBodySize = (body: unknown): number | undefined => {
  try {
    return JSON.stringify(body).length;
  } catch {
    // Body may be circular or non-serializable
    return undefined;
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
 * Common HTTP methods with automatic Sentry instrumentation
 * Each method wraps the provided fetcher function with span tracing,
 * error capture, and performance metrics
 *
 * @example
 * ```ts
 * const data = await httpClient.get('/api/users', () => fetch('/api/users').then(r => r.json()));
 * ```
 */
export const httpClient = {
  /**
   * Execute a GET request with instrumentation
   * @param url - Request URL for tracing
   * @param fetcher - Function that performs the actual HTTP request
   * @returns Promise resolving to the response data
   */
  get: <T>(url: string, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(buildHttpOptions("GET", url), fetcher),

  /**
   * Execute a POST request with instrumentation
   * @param url - Request URL for tracing
   * @param body - Request body (used for size calculation)
   * @param fetcher - Function that performs the actual HTTP request
   * @returns Promise resolving to the response data
   */
  post: <T>(url: string, body: unknown, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(buildHttpOptions("POST", url, body), fetcher),

  /**
   * Execute a PUT request with instrumentation
   * @param url - Request URL for tracing
   * @param body - Request body (used for size calculation)
   * @param fetcher - Function that performs the actual HTTP request
   * @returns Promise resolving to the response data
   */
  put: <T>(url: string, body: unknown, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(buildHttpOptions("PUT", url, body), fetcher),

  /**
   * Execute a DELETE request with instrumentation
   * @param url - Request URL for tracing
   * @param fetcher - Function that performs the actual HTTP request
   * @returns Promise resolving to the response data
   */
  delete: <T>(url: string, fetcher: () => Promise<T>) =>
    instrumentHttpRequest(buildHttpOptions("DELETE", url), fetcher),
};
