import "server-only";

import { getLogger } from "~/shared/logger";

const verifyEndpoint =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const CAPTCHA_SECRET_TOKEN = process.env.CAPTCHA_SECRET_TOKEN;

/**
 * @name verifyCaptchaToken
 * @description Verify the CAPTCHA token with the CAPTCHA service
 * @param token - The CAPTCHA token to verify
 */
export async function verifyCaptchaToken(token: string) {
  if (!CAPTCHA_SECRET_TOKEN) {
    throw new Error("CAPTCHA_SECRET_TOKEN is not set");
  }

  const formData = new FormData();

  formData.append("secret", CAPTCHA_SECRET_TOKEN);
  formData.append("response", token);

  const res = await fetch(verifyEndpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const logger = await getLogger();
    logger.error(
      {
        statusText: res.statusText,
        status: res.status,
      },
      "Captcha verification failed"
    );

    throw new Error("Failed to verify CAPTCHA token");
  }

  const data = await res.json();

  if (!data.success) {
    throw new Error("Invalid CAPTCHA token");
  }
}
