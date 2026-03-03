// biome-ignore-all lint/performance/noBarrelFile: Public API for mailcow integration

export {
  isMailcowConfigured,
  mailcowConfig,
  validateMailcowConfig,
} from "./config";
export {
  mailcowIntegration,
  registerMailcowIntegration,
} from "./implementation";
export type {
  CreateMailboxRequest,
  MailcowAccount,
  UpdateMailboxRequest,
} from "./types";
