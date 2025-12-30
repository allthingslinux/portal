import type { Mailer } from "~/lib/email/mailers/shared";
import { createRegistry } from "~/shared/registry";

import type { MailerProvider } from "./provider-enum";

/**
 * Email mailer registry for managing multiple email provider implementations.
 *
 * Currently only supports Nodemailer, but the registry pattern allows for easy
 * addition of other providers (e.g., Resend, SendGrid, Postmark) in the future
 * without changing the consuming code. This follows the same pattern used
 * throughout the codebase for monitoring, CMS, and other multi-provider systems.
 */
const mailerRegistry = createRegistry<Mailer, MailerProvider>();

mailerRegistry.register("nodemailer", async () => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { createNodemailerService } = await import(
      "~/lib/email/mailers/nodemailer"
    );

    return createNodemailerService();
  }
  throw new Error(
    "Nodemailer is not available on the edge runtime. Please use another mailer."
  );
});

export { mailerRegistry };
