import { sendEmail } from "@/lib/utils/email";

// ============================================================================
// Email Handlers for Better Auth
// ============================================================================
// All email-related handlers for authentication flows
// These functions use fire-and-forget pattern to prevent timing attacks

/**
 * Send password reset email
 * Fire and forget to prevent timing attacks
 * On serverless platforms, use waitUntil() to ensure email is sent
 */
export function sendResetPasswordEmail(
  { user, url }: { user: { email: string }; url: string },
  _request: unknown
): Promise<void> {
  // Fire and forget - don't await to prevent timing attacks
  return Promise.resolve(
    sendEmail({
      to: user.email,
      subject: "Reset your password - Portal",
      html: `
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${url}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    })
  ).catch((error: unknown) => {
    // Log error but don't throw to prevent timing attacks
    console.error("Failed to send password reset email:", error);
  });
}

/**
 * Send email verification email
 * Fire and forget to prevent timing attacks
 * On serverless platforms, use waitUntil() to ensure email is sent
 */
export function sendVerificationEmail(
  { user, url }: { user: { email: string }; url: string },
  _request: unknown
): Promise<void> {
  // Fire and forget - don't await to prevent timing attacks
  return Promise.resolve(
    sendEmail({
      to: user.email,
      subject: "Verify your email - Portal",
      html: `
        <h2>Verify Your Email</h2>
        <p>Welcome to Portal! Click the link below to verify your email:</p>
        <a href="${url}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      `,
    })
  ).catch((error: unknown) => {
    // Log error but don't throw to prevent timing attacks
    console.error("Failed to send verification email:", error);
  });
}

/**
 * Send OTP email for two-factor authentication
 * Fire and forget to prevent timing attacks
 * Matches Better Auth sendOTP signature: ({ user, otp }, ctx) => void
 */
export function sendOTPEmail(
  { user, otp }: { user: { email: string }; otp: string },
  _ctx?: unknown
): void {
  // Fire and forget - don't await to prevent timing attacks
  Promise.resolve(
    sendEmail({
      to: user.email,
      subject: "Your OTP - Portal",
      html: `
        <h2>Your One-Time Password</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    })
  ).catch((error: unknown) => {
    // Log error but don't throw to prevent timing attacks
    console.error("Failed to send OTP email:", error);
  });
}
