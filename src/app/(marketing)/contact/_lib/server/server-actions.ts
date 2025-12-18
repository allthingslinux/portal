"use server";

import { z } from "zod";

import { getMailer } from "~/core/email/mailers/core";
import { enhanceAction } from "~/shared/next/actions";

import { ContactEmailSchema } from "../contact-email.schema";

const contactEmail = z
  .string()
  .describe("The email where you want to receive the contact form submissions.")
  .parse(process.env.CONTACT_EMAIL);

const emailFrom = z
  .string()
  .describe("The email sending address.")
  .parse(process.env.EMAIL_SENDER);

export const sendContactEmail = enhanceAction(
  async (data) => {
    const mailer = await getMailer();

    await mailer.sendEmail({
      to: contactEmail,
      from: emailFrom,
      subject: "Contact Form Submission",
      html: `
        <p>
          You have received a new contact form submission.
        </p>

        <p>Name: ${data.name}</p>
        <p>Email: ${data.email}</p>
        <p>Message: ${data.message}</p>
      `,
    });

    return {};
  },
  {
    schema: ContactEmailSchema,
    auth: false,
  }
);
