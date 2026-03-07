import "server-only";

import { registerIrcIntegration } from "./irc";
import { registerMailcowIntegration } from "./mailcow";
import { registerMediaWikiIntegration } from "./mediawiki";
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
  registerMailcowIntegration();
  registerMediaWikiIntegration();
  integrationsRegistered = true;
}
