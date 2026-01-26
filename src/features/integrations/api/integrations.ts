import type { IntegrationPublicInfo } from "@/features/integrations/lib/integrations/core/types";

/**
 * Response type from integration API endpoints
 */
interface IntegrationApiResponse<T> {
  ok: boolean;
  error?: string;
  account?: T;
  integrations?: IntegrationPublicInfo[];
  message?: string;
}

/**
 * Fetch available integrations
 */
export async function fetchIntegrations(): Promise<IntegrationPublicInfo[]> {
  const response = await fetch("/api/integrations");

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error || `Failed to fetch integrations: ${response.statusText}`
    );
  }

  const data = (await response.json()) as IntegrationApiResponse<unknown>;
  return data.integrations ?? [];
}

/**
 * Fetch current user's integration account
 */
export async function fetchIntegrationAccount<TAccount>(
  integrationId: string
): Promise<TAccount | null> {
  const response = await fetch(`/api/integrations/${integrationId}/accounts`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error ||
        `Failed to fetch integration account: ${response.statusText}`
    );
  }

  const data = (await response.json()) as IntegrationApiResponse<TAccount>;
  return data.account ?? null;
}

/**
 * Fetch a specific integration account by ID
 */
export async function fetchIntegrationAccountById<TAccount>(
  integrationId: string,
  id: string
): Promise<TAccount> {
  const response = await fetch(
    `/api/integrations/${integrationId}/accounts/${id}`
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error ||
        `Failed to fetch integration account: ${response.statusText}`
    );
  }

  const data = (await response.json()) as IntegrationApiResponse<TAccount>;
  if (!data.account) {
    throw new Error("Integration account not found");
  }
  return data.account;
}

/**
 * Create a new integration account for the current user
 */
export async function createIntegrationAccount<TAccount>(
  integrationId: string,
  input: Record<string, unknown>
): Promise<TAccount> {
  const response = await fetch(`/api/integrations/${integrationId}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error ||
        `Failed to create integration account: ${response.statusText}`
    );
  }

  const result = (await response.json()) as IntegrationApiResponse<TAccount>;
  if (!result.account) {
    throw new Error(
      "Failed to create integration account: No account returned"
    );
  }
  return result.account;
}

/**
 * Update an integration account
 */
export async function updateIntegrationAccount<TAccount>(
  integrationId: string,
  id: string,
  input: Record<string, unknown>
): Promise<TAccount> {
  const response = await fetch(
    `/api/integrations/${integrationId}/accounts/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error ||
        `Failed to update integration account: ${response.statusText}`
    );
  }

  const result = (await response.json()) as IntegrationApiResponse<TAccount>;
  if (!result.account) {
    throw new Error(
      "Failed to update integration account: No account returned"
    );
  }
  return result.account;
}

/**
 * Delete an integration account
 */
export async function deleteIntegrationAccount(
  integrationId: string,
  id: string
): Promise<void> {
  const response = await fetch(
    `/api/integrations/${integrationId}/accounts/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(
      error.error ||
        `Failed to delete integration account: ${response.statusText}`
    );
  }
}
