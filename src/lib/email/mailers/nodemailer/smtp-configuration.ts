import { SmtpConfigSchema } from "~/lib/email/mailers/shared";
import { env } from "../../../../env";

export function getSMTPConfiguration() {
  const data = SmtpConfigSchema.parse({
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_TLS,
  });

  return {
    host: data.host,
    port: data.port,
    secure: data.secure,
    auth: {
      user: data.user,
      pass: data.pass,
    },
  };
}
