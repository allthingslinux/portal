import 'server-only';

import { SupabaseClient } from '@supabase/supabase-js';

import { getLogger } from '@portal/shared/logger';
import { Database, Json } from '@portal/supabase/database';

import {
  CreateNonceParams,
  CreateNonceResult,
  GetNonceStatusParams,
  GetNonceStatusResult,
  RevokeNonceParams,
  VerifyNonceParams,
  VerifyNonceResult,
} from '../types';

/**
 * @name createOtpService
 * @description Creates an instance of the OtpService
 * @param client
 */
export function createOtpService(client: SupabaseClient<Database>) {
  return new OtpService(client);
}

// Type declarations for RPC parameters
type CreateNonceRpcParams = {
  p_user_id?: string;
  p_purpose?: string;
  p_expires_in_seconds?: number;
  p_metadata?: Json;
  p_description?: string;
  p_tags?: string[];
  p_scopes?: string[];
  p_revoke_previous?: boolean;
};

type VerifyNonceRpcParams = {
  p_token: string;
  p_purpose: string;
  p_required_scopes?: string[];
  p_max_verification_attempts?: number;
};

/**
 * @name OtpService
 * @description Service for creating and verifying one-time tokens/passwords
 */
class OtpService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  /**
   * @name createNonce
   * @description Creates a new one-time token for a user
   * @param params
   */
  async createNonce(params: CreateNonceParams) {
    const logger = await getLogger();

    const {
      userId,
      purpose,
      expiresInSeconds = 900,
      metadata = {},
      description,
      tags,
      scopes,
      revokePrevious = true,
    } = params;

    const ctx = { userId, purpose, name: 'nonce' };

    logger.info(ctx, 'Creating one-time token');

    try {
      const result = await this.client.rpc('create_nonce', {
        p_user_id: userId,
        p_purpose: purpose,
        p_expires_in_seconds: expiresInSeconds,
        p_metadata: metadata as Json,
        p_description: description,
        p_tags: tags,
        p_scopes: scopes,
        p_revoke_previous: revokePrevious,
      } as CreateNonceRpcParams);

      if (result.error) {
        logger.error(
          { ...ctx, error: result.error.message },
          'Failed to create one-time token',
        );

        throw new Error(
          `Failed to create one-time token: ${result.error.message}`,
        );
      }

      const data = result.data as unknown as CreateNonceResult;

      logger.info(
        { ...ctx, revokedPreviousCount: data.revoked_previous_count },
        'One-time token created successfully',
      );

      return {
        id: data.id,
        token: data.token,
        expiresAt: data.expires_at,
        revokedPreviousCount: data.revoked_previous_count,
      };
    } catch (error) {
      logger.error({ ...ctx, error }, 'Error creating one-time token');
      throw error;
    }
  }

  /**
   * @name verifyNonce
   * @description Verifies a one-time token
   * @param params
   */
  async verifyNonce(params: VerifyNonceParams) {
    const logger = await getLogger();

    const {
      token,
      purpose,
      requiredScopes,
      maxVerificationAttempts = 1,
    } = params;

    const ctx = { purpose, name: 'verify-nonce' };

    logger.info(ctx, 'Verifying one-time token');

    try {
      const result = await this.client.rpc('verify_nonce', {
        p_token: token,
        p_user_id: params.userId,
        p_purpose: purpose,
        p_required_scopes: requiredScopes,
        p_max_verification_attempts: maxVerificationAttempts,
      } as VerifyNonceRpcParams);

      if (result.error) {
        logger.error(
          { ...ctx, error: result.error.message },
          'Failed to verify one-time token',
        );

        throw new Error(
          `Failed to verify one-time token: ${result.error.message}`,
        );
      }

      const data = result.data as unknown as VerifyNonceResult;

      logger.info(
        {
          ...ctx,
          ...data,
        },
        'One-time token verification complete',
      );

      return data;
    } catch (error) {
      logger.error({ ...ctx, error }, 'Error verifying one-time token');
      throw error;
    }
  }

  /**
   * @name revokeNonce
   * @description Revokes a one-time token to prevent its use
   * @param params
   */
  async revokeNonce(params: RevokeNonceParams) {
    const logger = await getLogger();
    const { id, reason } = params;
    const ctx = { id, reason, name: 'revoke-nonce' };

    logger.info(ctx, 'Revoking one-time token');

    try {
      const { data, error } = await this.client.rpc('revoke_nonce', {
        p_id: id,
        p_reason: reason,
      });

      if (error) {
        logger.error(
          { ...ctx, error: error.message },
          'Failed to revoke one-time token',
        );

        throw new Error(`Failed to revoke one-time token: ${error.message}`);
      }

      logger.info(
        { ...ctx, success: data },
        'One-time token revocation complete',
      );

      return {
        success: data,
      };
    } catch (error) {
      logger.error({ ...ctx, error }, 'Error revoking one-time token');
      throw error;
    }
  }

  /**
   * @name getNonceStatus
   * @description Gets the status of a one-time token
   * @param params
   */
  async getNonceStatus(params: GetNonceStatusParams) {
    const logger = await getLogger();
    const { id } = params;
    const ctx = { id, name: 'get-nonce-status' };

    logger.info(ctx, 'Getting one-time token status');

    try {
      const result = await this.client.rpc('get_nonce_status', {
        p_id: id,
      });

      if (result.error) {
        logger.error(
          { ...ctx, error: result.error.message },
          'Failed to get one-time token status',
        );

        throw new Error(
          `Failed to get one-time token status: ${result.error.message}`,
        );
      }

      const data = result.data as unknown as GetNonceStatusResult;

      logger.info(
        { ...ctx, exists: data.exists },
        'Retrieved one-time token status',
      );

      if (!data.exists) {
        return {
          exists: false,
        };
      }

      return {
        exists: data.exists,
        purpose: data.purpose,
        userId: data.user_id,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        usedAt: data.used_at,
        revoked: data.revoked,
        revokedReason: data.revoked_reason,
        verificationAttempts: data.verification_attempts,
        lastVerificationAt: data.last_verification_at,
        lastVerificationIp: data.last_verification_ip,
        isValid: data.is_valid,
      };
    } catch (error) {
      logger.error({ ...ctx, error }, 'Error getting one-time token status');
      throw error;
    }
  }
}
