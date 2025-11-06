/**
 * @name CreateNonceParams - Parameters for creating a nonce
 */
export interface CreateNonceParams {
  userId?: string;
  purpose: string;
  expiresInSeconds?: number;
  metadata?: Record<string, unknown>;
  description?: string;
  tags?: string[];
  scopes?: string[];
  revokePrevious?: boolean;
}

/**
 * @name VerifyNonceParams - Parameters for verifying a nonce
 */
export interface VerifyNonceParams {
  token: string;
  purpose: string;
  userId?: string;
  requiredScopes?: string[];
  maxVerificationAttempts?: number;
}

/**
 * @name RevokeNonceParams - Parameters for revoking a nonce
 */
export interface RevokeNonceParams {
  id: string;
  reason?: string;
}

/**
 * @name CreateNonceResult - Result of creating a nonce
 */
export interface CreateNonceResult {
  id: string;
  token: string;
  expires_at: string;
  revoked_previous_count?: number;
}

/**
 * @name ValidNonceResult - Result of verifying a nonce
 */
type ValidNonceResult = {
  valid: boolean;
  user_id?: string;
  metadata?: Record<string, unknown>;
  message?: string;
  scopes?: string[];
  purpose?: string;
};

/**
 * @name InvalidNonceResult - Result of verifying a nonce
 */
type InvalidNonceResult = {
  valid: false;
  message: string;
  max_attempts_exceeded?: boolean;
};

/**
 * @name VerifyNonceResult - Result of verifying a nonce
 */
export type VerifyNonceResult = ValidNonceResult | InvalidNonceResult;

/**
 * @name GetNonceStatusParams - Parameters for getting nonce status
 */
export interface GetNonceStatusParams {
  id: string;
}

/**
 * @name SuccessGetNonceStatusResult - Result of getting nonce status
 */
type SuccessGetNonceStatusResult = {
  exists: true;
  purpose?: string;
  user_id?: string;
  created_at?: string;
  expires_at?: string;
  used_at?: string;
  revoked?: boolean;
  revoked_reason?: string;
  verification_attempts?: number;
  last_verification_at?: string;
  last_verification_ip?: string;
  is_valid?: boolean;
};

/**
 * @name FailedGetNonceStatusResult - Result of getting nonce status
 */
type FailedGetNonceStatusResult = {
  exists: false;
};

/**
 * @name GetNonceStatusResult - Result of getting nonce status
 */
export type GetNonceStatusResult =
  | SuccessGetNonceStatusResult
  | FailedGetNonceStatusResult;

/**
 * @name SendOtpEmailParams - Parameters for sending an OTP email
 */
export interface SendOtpEmailParams {
  email: string;
  otp: string;
}
