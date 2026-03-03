import "server-only";

import { log } from "@portal/observability/utils";
import { startSpan } from "@sentry/nextjs";

import { mailcowConfig, validateMailcowConfig } from "./config";
import type {
  MailcowAlias,
  MailcowAppPassword,
  MailcowResponseEntry,
} from "./types";

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
  const method = options.method || "GET";

  log.debug(`Mailcow API request: ${method} ${path}`, {
    url,
    method,
  });

  const apiKey = mailcowConfig.apiKey;
  if (!apiKey) {
    throw new Error("MAILCOW_API_KEY is not configured");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      log.error("Mailcow API authentication failed", { path, method });
      throw new Error(
        "Mailcow API authentication failed (invalid or expired API key)"
      );
    }

    if (!response.ok) {
      const text = await response.text();
      log.error(`Mailcow API error (${response.status})`, {
        path,
        method,
        status: response.status,
        response: text,
      });
      throw new Error(`Mailcow API error (${response.status}): ${text}`);
    }

    const text = await response.text();
    let data: T;
    try {
      data = text ? (JSON.parse(text) as T) : ({} as T);
    } catch {
      log.error("Failed to parse Mailcow API response", { path, method, text });
      data = {} as T;
    }

    log.debug("Mailcow API response success", { path, method });
    return data;
  } catch (error) {
    if (!(error instanceof Error && error.message.includes("Mailcow API"))) {
      log.error("Mailcow API request failed", {
        path,
        method,
        error: error instanceof Error ? error.message : String(error),
      });
    }
    throw error;
  }
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
        password2: password, // confirmation required
        name,
        quota: 3072, // 3GB default, matching OpenAPI example and domain defaults
        active: 1,
        authsource: "mailcow",
      };

      const result = await mailcowRequest("/api/v1/add/mailbox", {
        method: "POST",
        body: JSON.stringify(body),
      });

      assertSuccess(result);
    }
  );
}

/**
 * Delete a mailbox from mailcow.
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
      const result = await mailcowRequest("/api/v1/delete/mailbox", {
        method: "POST",
        body: JSON.stringify([username]),
      });

      assertSuccess(result);
    }
  );
}

/**
 * Update a mailbox in mailcow.
 */
export function updateMailbox(
  username: string,
  data: Record<string, unknown>
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
      const result = await mailcowRequest("/api/v1/edit/mailbox", {
        method: "POST",
        body: JSON.stringify({
          items: [username],
          attr: data,
        }),
      });

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
        const first = result[0] as Record<string, unknown> | undefined;
        if (!first || typeof first !== "object") {
          return null;
        }
        // Mailcow sometimes returns error objects in the list
        if (first.type === "error" || first.type === "danger") {
          return null;
        }
        // Ensure it's a real mailbox object by checking for a known field
        return "username" in first ? first : null;
      }

      if (result && typeof result === "object") {
        const res = result as Record<string, unknown>;
        if (res.type === "error" || res.type === "danger") {
          return null;
        }
        return "username" in res ? res : null;
      }

      return null;
    }
  );
}

/**
 * Get domain from mailcow.
 */
export function getDomain(
  domain: string
): Promise<Record<string, unknown> | null> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow getDomain",
      attributes: {
        "mailcow.domain": domain,
      },
    },
    async () => {
      const encoded = encodeURIComponent(domain);
      const result = await mailcowRequest<
        Record<string, unknown> | Record<string, unknown>[]
      >(`/api/v1/get/domain/${encoded}`);

      if (Array.isArray(result)) {
        const first = result[0] as Record<string, unknown> | undefined;
        if (!first || typeof first !== "object") {
          return null;
        }
        if (first.type === "error" || first.type === "danger") {
          return null;
        }
        // Ensure it's a real domain object
        return "domain_name" in first || "domain" in first ? first : null;
      }

      if (result && typeof result === "object") {
        const res = result as Record<string, unknown>;
        if (res.type === "error" || res.type === "danger") {
          return null;
        }
        return "domain_name" in res || "domain" in res ? res : null;
      }

      return null;
    }
  );
}

/**
 * App Passwords
 */

const GENERATED_PASSWORD_REGEX = /Generated password: ([^ ]+)/;

export function getAppPasswords(
  accountId: string
): Promise<MailcowAppPassword[]> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow getAppPasswords",
      attributes: {
        "mailcow.accountId": accountId,
      },
    },
    async () => {
      const encoded = encodeURIComponent(accountId);
      const result = await mailcowRequest<MailcowAppPassword[]>(
        `/api/v1/get/app-passwd/${encoded}`
      );
      return Array.isArray(result) ? result : [];
    }
  );
}

export function createAppPassword(
  accountId: string,
  name: string
): Promise<{ app_passwd: string }> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow createAppPassword",
      attributes: {
        "mailcow.accountId": accountId,
        "mailcow.name": name,
      },
    },
    async () => {
      const body = {
        items: [accountId],
        app_passwd_name: name,
      };

      const result = await mailcowRequest<MailcowResponseEntry[]>(
        "/api/v1/add/app-passwd",
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      assertSuccess(result);

      // Extract the password from the response
      const entry = result[0] as MailcowResponseEntry & {
        app_passwd?: string;
      };
      const password =
        entry.app_passwd ||
        (Array.isArray(entry.log) ? (entry.log[0] as string) : undefined);

      if (!password && typeof entry.msg === "string") {
        // Some mailcow versions put it in the msg like "Generated password: XXX"
        const match = entry.msg.match(GENERATED_PASSWORD_REGEX);
        if (match) {
          return { app_passwd: match[1] };
        }
      }

      if (!password) {
        throw new Error("Could not find generated app password in response");
      }

      return { app_passwd: password };
    }
  );
}

export function deleteAppPassword(
  accountId: string,
  passwordId: string | number
): Promise<void> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow deleteAppPassword",
      attributes: {
        "mailcow.accountId": accountId,
        "mailcow.passwordId": passwordId,
      },
    },
    async () => {
      const result = await mailcowRequest("/api/v1/delete/app-passwd", {
        method: "POST",
        body: JSON.stringify([passwordId]),
      });

      assertSuccess(result);
    }
  );
}

/**
 * Aliases
 */

export function getAliases(accountId: string): Promise<MailcowAlias[]> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow getAliases",
      attributes: {
        "mailcow.accountId": accountId,
      },
    },
    async () => {
      const encoded = encodeURIComponent(accountId);
      const result = await mailcowRequest<MailcowAlias[]>(
        `/api/v1/get/alias/${encoded}`
      );
      return Array.isArray(result) ? result : [];
    }
  );
}

export function createAlias(
  address: string,
  goto: string,
  active = true,
  publicComment?: string
): Promise<void> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow createAlias",
      attributes: {
        "mailcow.address": address,
        "mailcow.goto": goto,
      },
    },
    async () => {
      const body = {
        address,
        goto,
        active: active ? 1 : 0,
        public_comment: publicComment,
      };

      const result = await mailcowRequest("/api/v1/add/alias", {
        method: "POST",
        body: JSON.stringify(body),
      });

      assertSuccess(result);
    }
  );
}

export function deleteAlias(aliasId: string | number): Promise<void> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow deleteAlias",
      attributes: {
        "mailcow.aliasId": aliasId,
      },
    },
    async () => {
      const result = await mailcowRequest("/api/v1/delete/alias", {
        method: "POST",
        body: JSON.stringify([aliasId]),
      });

      assertSuccess(result);
    }
  );
}

export function getMailboxUsage(
  accountId: string
): Promise<Record<string, unknown>> {
  return startSpan(
    {
      op: "http.client",
      name: "mailcow getMailboxUsage",
      attributes: {
        "mailcow.accountId": accountId,
      },
    },
    async () => {
      const mailbox = await getMailbox(accountId);
      if (!mailbox) {
        return { quota: 0, quota_used: 0, percent_in_use: 0 };
      }
      return {
        quota: Number(mailbox.quota), // Already in Bytes from API
        quota_used: Number(mailbox.quota_used), // Already in Bytes from API
        percent_in_use: Number(mailbox.percent_in_use),
      };
    }
  );
}
