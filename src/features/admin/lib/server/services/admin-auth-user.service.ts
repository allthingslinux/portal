import "server-only";

import { z } from "zod";

const REALM_REGEX = /\/realms\/([^/]+)\/?$/;
const REALM_STRIP_REGEX = /\/realms\/[^/]+\/?$/;
const WHITESPACE_REGEX = /\s+/;

type KeycloakAdminConfig = {
  issuer: string;
  realm: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
};

type CreateUserInput = {
  email: string;
  password: string;
  emailVerified: boolean;
};

export function createAdminAuthUserService() {
  return new AdminAuthUserService();
}

/**
 * Service for performing admin actions on users via Keycloak Admin API.
 */
class AdminAuthUserService {
  private readonly config = this.resolveConfig();

  /**
   * Create a user in Keycloak with optional verified email flag.
   */
  async createUser(params: CreateUserInput) {
    const token = await this.getAdminToken();

    const response = await fetch(
      `${this.config.baseUrl}/admin/realms/${this.config.realm}/users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: params.email,
          email: params.email,
          enabled: true,
          emailVerified: params.emailVerified,
          credentials: [
            {
              type: "password",
              temporary: !params.emailVerified,
              value: params.password,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const message = await this.getErrorMessage(response);
      throw new Error(`Failed to create user in Keycloak: ${message}`);
    }

    return { success: true };
  }

  /**
   * Delete a user from Keycloak.
   */
  async deleteUser(userId: string) {
    const token = await this.getAdminToken();
    const response = await fetch(
      `${this.config.baseUrl}/admin/realms/${this.config.realm}/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const message = await this.getErrorMessage(response);
      throw new Error(`Failed to delete user in Keycloak: ${message}`);
    }
  }

  /**
   * Disable a user (ban).
   */
  async banUser(userId: string) {
    await this.updateUserEnabled(userId, false);
  }

  /**
   * Enable a previously disabled user.
   */
  async reactivateUser(userId: string) {
    await this.updateUserEnabled(userId, true);
  }

  async impersonateUser(_userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    throw new Error("Impersonation via Keycloak is not implemented");
  }

  async resetPassword(_userId: string) {
    throw new Error("Reset password via Keycloak is not implemented");
  }

  /**
   * Update user name in Keycloak.
   * @param userId - Keycloak user ID (UUID from userinfo.sub)
   * @param name - Full name to set (will be split into first/last if contains space)
   */
  async updateUserName(userId: string, name: string) {
    const token = await this.getAdminToken();

    // Parse name: if it has spaces, split into first/last; otherwise use as single name
    const nameParts = name.trim().split(WHITESPACE_REGEX);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // According to Keycloak API docs, we need to send firstName and lastName
    // If name has no spaces, set firstName to the name and lastName to empty string
    const updatePayload: {
      firstName: string;
      lastName: string;
    } = {
      firstName: firstName || name, // Fallback to full name if firstName is empty
      lastName: lastName || "", // Empty string if no last name
    };

    const url = `${this.config.baseUrl}/admin/realms/${this.config.realm}/users/${userId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const message = await this.getErrorMessage(response);
      throw new Error(`Failed to update user name in Keycloak: ${message}`);
    }

    return { success: true };
  }

  private async updateUserEnabled(userId: string, enabled: boolean) {
    const token = await this.getAdminToken();
    const response = await fetch(
      `${this.config.baseUrl}/admin/realms/${this.config.realm}/users/${userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      }
    );

    if (!response.ok) {
      const message = await this.getErrorMessage(response);
      throw new Error(
        `Failed to ${enabled ? "reactivate" : "ban"} user in Keycloak: ${message}`
      );
    }
  }

  /**
   * Get admin token (exposed for use in other modules)
   */
  async getAdminToken(): Promise<string> {
    const response = await fetch(
      `${this.config.baseUrl}/realms/${this.config.realm}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }).toString(),
      }
    );

    if (!response.ok) {
      const message = await this.getErrorMessage(response);
      throw new Error(`Failed to fetch Keycloak admin token: ${message}`);
    }

    const data = (await response.json()) as { access_token?: string };
    if (!data.access_token) {
      throw new Error("Keycloak admin token response missing access_token");
    }

    return data.access_token;
  }

  private resolveConfig(): KeycloakAdminConfig {
    const envSchema = z.object({
      issuer: z.string().url(),
      adminClientId: z.string(),
      adminClientSecret: z.string(),
    });

    const parsed = envSchema.parse({
      issuer: process.env.KEYCLOAK_ISSUER,
      adminClientId:
        process.env.KEYCLOAK_ADMIN_CLIENT_ID || process.env.KEYCLOAK_ID,
      adminClientSecret:
        process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || process.env.KEYCLOAK_SECRET,
    });

    const realmMatch = parsed.issuer.match(REALM_REGEX);
    if (!realmMatch) {
      throw new Error(
        "Could not parse Keycloak realm from KEYCLOAK_ISSUER. Expected .../realms/{realm}"
      );
    }

    const realm = realmMatch[1];
    const baseUrl = parsed.issuer.replace(REALM_STRIP_REGEX, "");

    return {
      issuer: parsed.issuer,
      realm,
      baseUrl,
      clientId: parsed.adminClientId,
      clientSecret: parsed.adminClientSecret,
    };
  }

  private async getErrorMessage(response: Response): Promise<string> {
    try {
      const text = await response.text();
      return `${response.status} ${response.statusText} - ${text}`;
    } catch (_error) {
      return `${response.status} ${response.statusText}`;
    }
  }
}
