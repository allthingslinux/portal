import "server-only";

import { z } from "zod";

export const SmtpConfigSchema = z.object({
  user: z
    .string()
    .describe(
      "This is the email account to send emails from. This is specific to the email provider."
    ),
  pass: z.string().describe("This is the password for the email account"),
  host: z.string().describe("This is the SMTP host for the email provider"),
  port: z
    .number()
    .describe("This is the port for the email provider. Normally 587 or 465."),
  secure: z
    .boolean()
    .describe("This is whether the connection is secure or not"),
});
