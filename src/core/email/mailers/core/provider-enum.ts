import { z } from "zod";

const MAILER_PROVIDERS = [
  "nodemailer",
  // add more providers here
] as const;

const MAILER_PROVIDER = z
  .enum(MAILER_PROVIDERS)
  .default("nodemailer")
  .parse(process.env.MAILER_PROVIDER);

export { MAILER_PROVIDER };

export type MailerProvider = (typeof MAILER_PROVIDERS)[number];
