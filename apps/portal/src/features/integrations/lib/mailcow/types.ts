// ============================================================================
// mailcow Types
// ============================================================================
// TypeScript types for mailcow account management

export type {
  CreateMailboxRequest,
  MailcowAccount,
  MailcowAccountStatus,
  MailcowAlias,
  MailcowAppPassword,
  UpdateMailboxRequest,
  UpdateMailboxStatus,
} from "@portal/schemas/integrations/mailcow";

export interface MailcowResponseEntry {
  log?: unknown;
  msg: string | string[];
  type: "success" | "danger" | "error";
}
