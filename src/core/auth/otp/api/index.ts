/**
 * @file API for one-time passwords/tokens
 *
 * Usage
 *
 * ```typescript
 * import { createOtpApi } from '../../api';
 * import { getSupabaseServerClient } from '../../../supabase/server-client';
 * import { NoncePurpose } from '../../types';
 *
 * const client = getSupabaseServerClient();
 * const api = createOtpApi(client);
 *
 * // Create a one-time password token
 * const { token } = await api.createToken({
 *   userId: user.id,
 *   purpose: NoncePurpose.PASSWORD_RESET, // Or use a custom string like 'password-reset'
 *   expiresInSeconds: 3600, // 1 hour
 *   metadata: { redirectTo: '/reset-password' },
 * });
 *
 * // Verify a token
 * const result = await api.verifyToken({
 *   token: '...',
 *   purpose: NoncePurpose.PASSWORD_RESET, // Must match the purpose used when creating
 * });
 *
 * if (result.valid) {
 *   // Token is valid
 *   const { userId, metadata } = result;
 *   // Proceed with the operation
 * } else {
 *   // Token is invalid or expired
 * }
 * ```
 */
import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '~/core/database/supabase/database.types';

import { createOtpEmailService } from '../server/otp-email.service';
import { createOtpService } from '../server/otp.service';
import {
  CreateNonceParams,
  GetNonceStatusParams,
  RevokeNonceParams,
  SendOtpEmailParams,
  VerifyNonceParams,
} from '../types';

/**
 * @name createOtpApi
 * @description Create an instance of the OTP API
 * @param client
 */
export function createOtpApi(client: SupabaseClient<Database>) {
  return new OtpApi(client);
}

/**
 * @name OtpApi
 * @description API for working with one-time tokens/passwords
 */
class OtpApi {
  private readonly service: ReturnType<typeof createOtpService>;
  private readonly emailService: ReturnType<typeof createOtpEmailService>;

  constructor(client: SupabaseClient<Database>) {
    this.service = createOtpService(client);
    this.emailService = createOtpEmailService();
  }

  /**
   * @name sendOtpEmail
   * @description Sends an OTP email to the user
   * @param params
   */
  sendOtpEmail(params: SendOtpEmailParams) {
    return this.emailService.sendOtpEmail(params);
  }

  /**
   * @name createToken
   * @description Creates a new one-time token
   * @param params
   */
  createToken(params: CreateNonceParams) {
    return this.service.createNonce(params);
  }

  /**
   * @name verifyToken
   * @description Verifies a one-time token
   * @param params
   */
  verifyToken(params: VerifyNonceParams) {
    return this.service.verifyNonce(params);
  }

  /**
   * @name revokeToken
   * @description Revokes a one-time token to prevent its use
   * @param params
   */
  revokeToken(params: RevokeNonceParams) {
    return this.service.revokeNonce(params);
  }

  /**
   * @name getTokenStatus
   * @description Gets the status of a one-time token
   * @param params
   */
  getTokenStatus(params: GetNonceStatusParams) {
    return this.service.getNonceStatus(params);
  }
}
