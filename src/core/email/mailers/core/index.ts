import { MAILER_PROVIDER } from "./provider-enum";
import { mailerRegistry } from "./registry";

/**
 * @name getMailer
 * @description Get the mailer based on the environment variable using the registry internally.
 */
export function getMailer() {
  return mailerRegistry.get(MAILER_PROVIDER);
}

export type { MailerProvider } from "./provider-enum";
// Re-export for convenience - using direct re-export to avoid noExportedImports
export { MAILER_PROVIDER } from "./provider-enum";
