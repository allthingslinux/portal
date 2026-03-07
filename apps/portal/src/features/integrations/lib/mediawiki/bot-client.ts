import "server-only";

import { captureException } from "@sentry/nextjs";

import { keys } from "./keys";
import type {
  RawBlockResponse,
  RawCreateAccountResponse,
  RawLoginResponse,
  RawResetPasswordResponse,
  RawTokenResponse,
  RawUserContribsResponse,
  RawUserInfoResponse,
  UserContrib,
  UserInfo,
} from "./types";
import { BASE_URL } from "@/config/app";

/**
 * Authenticated MediaWiki bot client for write operations.
 *
 * Maintains session cookies across requests and performs privileged actions
 * (account creation, blocking, password reset) using bot credentials from
 * Special:BotPasswords.
 *
 * Separate from the read-only `MediaWikiClient` which handles unauthenticated
 * GET queries (site stats, recent changes, page info).
 */
export class MediaWikiBotClient {
  private readonly cookies: Map<string, string> = new Map();
  private authenticated = false;
  private loginFailed = false;

  private readonly userAgent =
    "Portal/1.0 (https://portal.atl.tools; contact@atl.dev)";

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /** Build a `Cookie` header value from the stored cookie map. */
  private buildCookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  /** Parse `set-cookie` headers from a Response and store them. */
  private storeCookies(response: Response): void {
    const setCookieHeaders = response.headers.getSetCookie();
    for (const header of setCookieHeaders) {
      // Each set-cookie header looks like: name=value; Path=/; HttpOnly; ...
      const firstPart = header.split(";")[0];
      if (firstPart) {
        const eqIndex = firstPart.indexOf("=");
        if (eqIndex > 0) {
          const name = firstPart.slice(0, eqIndex).trim();
          const value = firstPart.slice(eqIndex + 1).trim();
          this.cookies.set(name, value);
        }
      }
    }
  }

  /**
   * Make a GET request to the MediaWiki API with session cookies.
   */
  private async get<T>(
    params: Record<string, string | number | undefined>
  ): Promise<T> {
    const env = keys();
    const url = new URL(env.WIKI_API_URL);
    url.searchParams.set("format", "json");
    url.searchParams.set("formatversion", "2");
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const headers: Record<string, string> = {
      "User-Agent": this.userAgent,
    };
    if (this.cookies.size > 0) {
      headers.Cookie = this.buildCookieHeader();
    }

    const response = await fetch(url.toString(), { headers });
    this.storeCookies(response);

    if (!response.ok) {
      throw new Error(
        `MediaWiki API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make a POST request to the MediaWiki API with session cookies.
   * Uses `application/x-www-form-urlencoded` content type.
   */
  private async post<T>(
    params: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const env = keys();
    const url = new URL(env.WIKI_API_URL);

    const body = new URLSearchParams();
    body.set("format", "json");
    body.set("formatversion", "2");
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        body.set(key, String(value));
      }
    }

    const headers: Record<string, string> = {
      "User-Agent": this.userAgent,
      "Content-Type": "application/x-www-form-urlencoded",
    };
    if (this.cookies.size > 0) {
      headers.Cookie = this.buildCookieHeader();
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: body.toString(),
    });
    this.storeCookies(response);

    if (!response.ok) {
      throw new Error(
        `MediaWiki API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------

  /**
   * Perform the two-step MediaWiki login:
   * 1. Fetch a login token via `action=query&meta=tokens&type=login`
   * 2. POST `action=login` with `lgname`, `lgpassword`, `lgtoken`
   *
   * Stores all session cookies from both requests.
   */
  async login(): Promise<void> {
    const env = keys();
    const username = env.WIKI_BOT_USERNAME;
    const password = env.WIKI_BOT_PASSWORD;

    if (!(username && password)) {
      this.loginFailed = true;
      const error = new Error(
        "MediaWiki bot credentials not configured: WIKI_BOT_USERNAME and WIKI_BOT_PASSWORD are required"
      );
      captureException(error, {
        tags: { integration: "mediawiki", step: "login_credentials" },
      });
      throw error;
    }

    // Step 1: Fetch login token
    const tokenData = await this.get<RawTokenResponse>({
      action: "query",
      meta: "tokens",
      type: "login",
    });

    const loginToken = tokenData.query?.tokens?.logintoken;
    if (!loginToken) {
      this.loginFailed = true;
      const error = new Error(
        "Failed to obtain login token from MediaWiki API"
      );
      captureException(error, {
        tags: { integration: "mediawiki", step: "login_token" },
      });
      throw error;
    }

    // Step 2: POST login with credentials
    const loginData = await this.post<RawLoginResponse>({
      action: "login",
      lgname: username,
      lgpassword: password,
      lgtoken: loginToken,
    });

    if (loginData.login?.result !== "Success") {
      this.loginFailed = true;
      const reason =
        loginData.login?.reason ?? loginData.login?.result ?? "Unknown error";
      const error = new Error(`MediaWiki bot login failed: ${reason}`);
      captureException(error, {
        tags: { integration: "mediawiki", step: "login_result" },
        extra: { result: loginData.login?.result },
      });
      throw error;
    }

    this.authenticated = true;
    this.loginFailed = false;
  }

  /**
   * Ensure the bot is authenticated. Calls `login()` lazily on first use.
   * Throws if a previous login attempt failed.
   */
  private async ensureAuthenticated(): Promise<void> {
    if (this.authenticated) {
      return;
    }

    if (this.loginFailed) {
      throw new Error(
        "MediaWiki bot login previously failed. Cannot perform write operations."
      );
    }

    await this.login();
  }

  // ---------------------------------------------------------------------------
  // Token management
  // ---------------------------------------------------------------------------

  /**
   * Fetch a token of the given type from the MediaWiki API.
   * Requires an authenticated session.
   */
  async getToken(type: "csrf" | "createaccount" | "login"): Promise<string> {
    const data = await this.get<RawTokenResponse>({
      action: "query",
      meta: "tokens",
      type,
    });

    const tokenKey = `${type}token`;
    const token = data.query?.tokens?.[tokenKey];
    if (!token) {
      throw new Error(`Failed to obtain ${type} token from MediaWiki API`);
    }

    return token;
  }

  /**
   * Execute an authenticated write operation with single-retry on token rejection.
   * If the operation fails with a `badtoken` error, re-authenticates and retries once.
   */
  private async withTokenRetry<T>(
    operation: () => Promise<T>,
    checkError: (result: T) => { isBadToken: boolean; errorMessage?: string }
  ): Promise<T> {
    await this.ensureAuthenticated();

    const result = await operation();
    const { isBadToken, errorMessage } = checkError(result);

    if (isBadToken) {
      // Re-authenticate once and retry
      this.authenticated = false;
      this.loginFailed = false;
      await this.login();

      const retryResult = await operation();
      const retryCheck = checkError(retryResult);
      if (retryCheck.isBadToken || retryCheck.errorMessage) {
        throw new Error(
          retryCheck.errorMessage ??
            "MediaWiki API operation failed after re-authentication"
        );
      }
      return retryResult;
    }

    if (errorMessage) {
      throw new Error(errorMessage);
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // Account management
  // ---------------------------------------------------------------------------

  /**
   * Create a wiki account via `action=createaccount`.
   * Returns the created username and user ID.
   */
  async createAccount(
    username: string,
    password: string
  ): Promise<{ username: string; userId: number }> {
    const result = await this.withTokenRetry(
      async () => {
        const token = await this.getToken("createaccount");
        return this.post<RawCreateAccountResponse>({
          action: "createaccount",
          username,
          password,
          retype: password,
          createreturnurl: BASE_URL,
          createtoken: token,
        });
      },
      (response) => {
        const error = (
          response as unknown as { error?: { code: string; info: string } }
        ).error;
        if (error?.code === "badtoken") {
          return { isBadToken: true };
        }
        if (response.createaccount?.status !== "PASS") {
          const message =
            response.createaccount?.message ??
            error?.info ??
            `Account creation failed: ${response.createaccount?.status ?? "unknown"}`;
          return { isBadToken: false, errorMessage: message };
        }
        return { isBadToken: false };
      }
    );

    return {
      username: result.createaccount.username ?? username,
      userId: result.createaccount.userid ?? 0,
    };
  }

  /**
   * Reset a user's password via `action=resetpassword`.
   * Sends a password reset email to the email configured on the wiki account.
   */
  async resetPassword(username: string): Promise<void> {
    await this.withTokenRetry(
      async () => {
        const token = await this.getToken("csrf");
        return this.post<RawResetPasswordResponse>({
          action: "resetpassword",
          user: username,
          token,
        });
      },
      (result) => {
        const error = result.error;
        if (error?.code === "badtoken") {
          return { isBadToken: true };
        }
        if (error) {
          return {
            isBadToken: false,
            errorMessage: `Password reset failed: ${error.info}`,
          };
        }
        return { isBadToken: false };
      }
    );
  }

  /**
   * Block a user via `action=block`.
   */
  async blockUser(
    username: string,
    reason: string,
    options?: { expiry?: string; nocreate?: boolean; autoblock?: boolean }
  ): Promise<void> {
    await this.withTokenRetry(
      async () => {
        const token = await this.getToken("csrf");
        return this.post<RawBlockResponse>({
          action: "block",
          user: username,
          reason,
          token,
          expiry: options?.expiry ?? "infinite",
          nocreate: options?.nocreate ? "1" : undefined,
          autoblock: options?.autoblock ? "1" : undefined,
        });
      },
      (result) => {
        const error = result.error;
        if (error?.code === "badtoken") {
          return { isBadToken: true };
        }
        if (error) {
          return {
            isBadToken: false,
            errorMessage: `Block failed: ${error.info}`,
          };
        }
        return { isBadToken: false };
      }
    );
  }

  /**
   * Unblock a user via `action=unblock`.
   */
  async unblockUser(username: string, reason: string): Promise<void> {
    await this.withTokenRetry(
      async () => {
        const token = await this.getToken("csrf");
        return this.post<{ error?: { code: string; info: string } }>({
          action: "unblock",
          user: username,
          reason,
          token,
        });
      },
      (result) => {
        if (result.error?.code === "badtoken") {
          return { isBadToken: true };
        }
        if (result.error) {
          return {
            isBadToken: false,
            errorMessage: `Unblock failed: ${result.error.info}`,
          };
        }
        return { isBadToken: false };
      }
    );
  }

  // ---------------------------------------------------------------------------
  // Read operations (using authenticated session)
  // ---------------------------------------------------------------------------

  /**
   * Get user info (edit count, registration, groups, block status) via `list=users`.
   */
  async getUserInfo(username: string): Promise<UserInfo> {
    await this.ensureAuthenticated();

    const data = await this.get<RawUserInfoResponse>({
      action: "query",
      list: "users",
      ususers: username,
      usprop: "editcount|registration|groups|blockinfo",
    });

    const user = data.query?.users?.[0];
    if (!user || user.missing) {
      throw new Error(`MediaWiki user not found: ${username}`);
    }

    return {
      userId: user.userid ?? 0,
      name: user.name,
      editCount: user.editcount ?? 0,
      registration: user.registration ?? "",
      groups: user.groups ?? [],
      blockExpiry: user.blockexpiry,
    };
  }

  /**
   * Get recent contributions for a user via `list=usercontribs`.
   */
  async getUserContribs(username: string, limit = 10): Promise<UserContrib[]> {
    await this.ensureAuthenticated();

    const data = await this.get<RawUserContribsResponse>({
      action: "query",
      list: "usercontribs",
      ucuser: username,
      uclimit: limit,
      ucprop: "title|timestamp|comment|sizediff",
    });

    return (data.query?.usercontribs ?? []).map((contrib) => ({
      title: contrib.title,
      timestamp: contrib.timestamp,
      comment: contrib.comment ?? "",
      sizeDiff: contrib.sizediff ?? 0,
    }));
  }
}

// ---------------------------------------------------------------------------
// Singleton instance
// ---------------------------------------------------------------------------

export const mediawikiBotClient = new MediaWikiBotClient();
