import "server-only";

import { registerXmppIntegration } from "./xmpp";

let integrationsRegistered = false;

/**
 * Register all integrations in the registry (idempotent).
 */
export function registerIntegrations(): void {
  if (integrationsRegistered) {
    return;
  }

  registerXmppIntegration();
  integrationsRegistered = true;
}
