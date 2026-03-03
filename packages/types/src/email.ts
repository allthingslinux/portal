/**
 * Email service types
 */

/**
 * Email options for sending emails
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}
