import { MAILER_PROVIDER } from './provider-enum';
import { mailerRegistry } from './registry';

/**
 * @name getMailer
 * @description Get the mailer based on the environment variable using the registry internally.
 */
export function getMailer() {
  return mailerRegistry.get(MAILER_PROVIDER);
}

export { MAILER_PROVIDER };
