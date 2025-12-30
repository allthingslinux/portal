import "server-only";

type KeycloakUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
};

type UserUpdateData = {
  email?: string;
  firstName?: string;
  lastName?: string;
};

class KeycloakAdminService {
  private readonly baseUrl: string;
  private readonly realm: string;
  private readonly adminUser: string;
  private readonly adminPassword: string;

  constructor() {
    this.baseUrl = (process.env.KEYCLOAK_ISSUER || "").replace(
      "/realms/portal",
      ""
    );
    this.realm = "portal";
    this.adminUser = process.env.KEYCLOAK_ADMIN_USER || "";
    this.adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || "";
  }

  private async getAdminToken(): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/realms/master/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "password",
          client_id: "admin-cli",
          username: this.adminUser,
          password: this.adminPassword,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get admin token");
    }

    const data = await response.json();
    return data.access_token;
  }

  async updateUser(
    keycloakUserId: string,
    updates: UserUpdateData
  ): Promise<void> {
    const token = await this.getAdminToken();

    const response = await fetch(
      `${this.baseUrl}/admin/realms/${this.realm}/users/${keycloakUserId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: updates.email,
          firstName: updates.firstName,
          lastName: updates.lastName,
          emailVerified: false, // Force re-verification if email changed
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to update user in Keycloak: ${response.statusText}`
      );
    }
  }

  async findUserByEmail(email: string): Promise<KeycloakUser | null> {
    const token = await this.getAdminToken();

    const response = await fetch(
      `${this.baseUrl}/admin/realms/${this.realm}/users?email=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search users");
    }

    const users = await response.json();
    return users.length > 0 ? users[0] : null;
  }
}

export const keycloakAdmin = new KeycloakAdminService();
