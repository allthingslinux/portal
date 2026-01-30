// biome-ignore-all lint/performance/noBarrelFile: Public API for IRC integration
import "server-only";

export { AthemeFaultError, registerNick } from "./atheme/client";
export { ircConfig, isIrcConfigured } from "./config";
export { ircIntegration, registerIrcIntegration } from "./implementation";
export type {
  AthemeFault,
  AthemeFaultCode,
  CreateIrcAccountRequest,
  CreateIrcAccountResult,
  IrcAccount,
  IrcAccountStatus,
  UpdateIrcAccountRequest,
} from "./types";
export {
  generateIrcPassword,
  IRC_NICK_MAX_LENGTH,
  isValidIrcNick,
} from "./utils";
