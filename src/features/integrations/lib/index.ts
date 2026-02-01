import "server-only";

import { registerIrcIntegration } from "./irc";
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
  registerIrcIntegration();
  integrationsRegistered = true;
}
