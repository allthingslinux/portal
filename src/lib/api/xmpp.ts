// ============================================================================
// XMPP API Client Functions
// ============================================================================
// Client-side functions for calling XMPP account API endpoints

import {
  createIntegrationAccount,
  deleteIntegrationAccount,
  fetchIntegrationAccount,
  fetchIntegrationAccountById,
  updateIntegrationAccount,
} from "@/lib/api/integrations";
import type {
  CreateXmppAccountRequest,
  UpdateXmppAccountRequest,
  XmppAccount,
} from "@/lib/integrations/xmpp/types";

const integrationId = "xmpp";

/**
 * Fetch current user's XMPP account
 */
export function fetchXmppAccount(): Promise<XmppAccount | null> {
  return fetchIntegrationAccount<XmppAccount>(integrationId);
}

/**
 * Fetch a specific XMPP account by ID
 */
export function fetchXmppAccountById(id: string): Promise<XmppAccount> {
  return fetchIntegrationAccountById<XmppAccount>(integrationId, id);
}

/**
 * Create a new XMPP account for the current user
 */
export function createXmppAccount(
  data: CreateXmppAccountRequest
): Promise<XmppAccount> {
  return createIntegrationAccount<XmppAccount>(integrationId, data);
}

/**
 * Update an XMPP account
 */
export function updateXmppAccount(
  id: string,
  data: UpdateXmppAccountRequest
): Promise<XmppAccount> {
  return updateIntegrationAccount<XmppAccount>(integrationId, id, data);
}

/**
 * Delete an XMPP account
 */
export function deleteXmppAccount(id: string): Promise<void> {
  return deleteIntegrationAccount(integrationId, id);
}
