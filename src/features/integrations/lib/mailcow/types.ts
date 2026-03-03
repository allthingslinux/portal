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
} from "../../../../shared/schemas/integrations/mailcow";

export interface MailcowResponseEntry {
  type: "success" | "danger" | "error";
  msg: string | string[];
  log?: unknown;
}
