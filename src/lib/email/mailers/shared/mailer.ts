import type { z } from "zod";

import type { MailerSchema } from "./schema/mailer.schema";

export abstract class Mailer<Res = unknown> {
  abstract sendEmail(data: z.infer<typeof MailerSchema>): Promise<Res>;
}
