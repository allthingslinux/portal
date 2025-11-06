import { z } from 'zod';

import { renderOtpEmail } from '~/core/email/email-templates';
import { getMailer } from '~/core/email/mailers/core';
import { getLogger } from '~/shared/logger';

const EMAIL_SENDER = z
  .string({
    required_error: 'EMAIL_SENDER is required',
  })
  .min(1)
  .parse(process.env.EMAIL_SENDER);

const PRODUCT_NAME = z
  .string({
    required_error: 'PRODUCT_NAME is required',
  })
  .min(1)
  .parse(process.env.NEXT_PUBLIC_PRODUCT_NAME);

/**
 * @name createOtpEmailService
 * @description Creates a new OtpEmailService
 * @returns {OtpEmailService}
 */
export function createOtpEmailService() {
  return new OtpEmailService();
}

/**
 * @name OtpEmailService
 * @description Service for sending OTP emails
 */
class OtpEmailService {
  async sendOtpEmail(params: { email: string; otp: string }) {
    const logger = await getLogger();
    const { email, otp } = params;
    const mailer = await getMailer();

    const { html, subject } = await renderOtpEmail({
      otp,
      productName: PRODUCT_NAME,
    });

    try {
      logger.info({ otp }, 'Sending OTP email...');

      await mailer.sendEmail({
        to: email,
        subject,
        html,
        from: EMAIL_SENDER,
      });

      logger.info({ otp }, 'OTP email sent');
    } catch (error) {
      logger.error({ otp, error }, 'Error sending OTP email');

      throw error;
    }
  }
}
