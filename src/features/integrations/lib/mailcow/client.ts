import "server-only";

import { startSpan } from "@sentry/nextjs";

import { mailcowConfig, validateMailcowConfig } from "./config";

interface MailcowResponseEntry {
  type: "success" | "danger" | "error";
  msg: string | string[];
  log?: unknown;
}

/**
 * Base URL for mailcow API (no trailing slash).
 * MAILCOW_API_URL should be the mailcow UI origin only (e.g. https://mail.atl.tools).
 * Paths like /api/v1/add/mailbox are appended here.
 */
function getBaseUrl(): string {
  validateMailcowConfig();
  const url = mailcowConfig.apiUrl;
  if (!url) {
    throw new Error("MAILCOW_API_URL is not configured");
  }
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

async function mailcowRequest<T = MailcowResponseEntry[]>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  validateMailcowConfig();
  const url = `${getBaseUrl()}${path}`;

  const apiKey = mailcowConfig.apiKey;
  if (!apiKey) {
    throw new Error("MAILCOW_API_KEY is not configured");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    throw new Error(
      "Mailcow API authentication failed (invalid or expired API key)"
    );
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mailcow API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as T;
  return data;
}

/**
 * Parse mailcow array response and throw on error/danger.
 */
function assertSuccess(entries: MailcowResponseEntry[]): void {
  const first = Array.isArray(entries) ? entries[0] : entries;
  if (!first) {
    return;
  }

  if (first.type === "error" || first.type === "danger") {
    const msg = Array.isArray(first.msg) ? first.msg.join(" ") : first.msg;
    throw new Error(msg || "Mailcow API returned an error");
  }
}

/**
 * Create a mailbox in mailcow.
 */
export function createMailbox(
  domain: string,
  localPart: string,
  password: string,
  name: string
): Promise<void> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow createMailbox",
      attributes: {
        "mailcow.domain": domain,
        "mailcow.local_part": localPart,
      },
    },
    async () => {
      const body = {
        domain,
        local_part: localPart,
        password,
        password2: password,
        name: name || localPart,
        active: "1",
      };

      const result = await mailcowRequest<MailcowResponseEntry[]>(
        "/api/v1/add/mailbox",
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      assertSuccess(result);
    }
  );
}

/**
 * Update a mailbox in mailcow (status, password, etc.).
 */
export function updateMailbox(
  username: string,
  attr: Record<string, unknown>
): Promise<void> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow updateMailbox",
      attributes: {
        "mailcow.username": username,
      },
    },
    async () => {
      const body = {
        items: [username],
        attr: { ...attr },
      };

      const result = await mailcowRequest<MailcowResponseEntry[]>(
        "/api/v1/edit/mailbox",
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      assertSuccess(result);
    }
  );
}

/**
 * Delete a mailbox in mailcow.
 */
export function deleteMailbox(username: string): Promise<void> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow deleteMailbox",
      attributes: {
        "mailcow.username": username,
      },
    },
    async () => {
      const body = { items: [username] };

      const result = await mailcowRequest<MailcowResponseEntry[]>(
        "/api/v1/delete/mailbox",
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      assertSuccess(result);
    }
  );
}

/**
 * Get mailbox from mailcow (returns single object or null if not found).
 */
export function getMailbox(
  username: string
): Promise<Record<string, unknown> | null> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow getMailbox",
      attributes: {
        "mailcow.username": username,
      },
    },
    async () => {
      const encoded = encodeURIComponent(username);
      const result = await mailcowRequest<
        Record<string, unknown> | Record<string, unknown>[]
      >(`/api/v1/get/mailbox/${encoded}`);

      if (Array.isArray(result)) {
        const first = result[0];
        return first && typeof first === "object"
          ? (first as Record<string, unknown>)
          : null;
      }

      return result && typeof result === "object" ? result : null;
    }
  );
}

/**
 * Get domain from mailcow to validate it exists.
 */
export function getDomain(
  id: string
): Promise<Record<string, unknown> | Record<string, unknown>[] | null> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow getDomain",
      attributes: {
        "mailcow.domain_id": id,
      },
    },
    async () => {
      const encoded = encodeURIComponent(id);
      const result = await mailcowRequest<
        Record<string, unknown> | Record<string, unknown>[]
      >(`/api/v1/get/domain/${encoded}`);

      if (Array.isArray(result) && result.length > 0) {
        return result;
      }

      return result && typeof result === "object" ? result : null;
    }
  );
}
