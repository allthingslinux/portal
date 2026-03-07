/**
 * Email service types
 */

/**
 * Email options for sending emails
 */
export interface EmailOptions {
  html?: string;
  subject: string;
  text?: string;
  to: string;
}
