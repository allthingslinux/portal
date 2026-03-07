// biome-ignore-all lint/performance/noBarrelFile: Public API for MediaWiki integration
import "server-only";

export { mediawikiBotClient } from "./bot-client";
export type { PageInfo, RecentChange, SiteStats } from "./client";
export { mediawiki } from "./client";
export {
  mediawikiIntegration,
  registerMediaWikiIntegration,
} from "./implementation";
export { isMediaWikiConfigured } from "./keys";
export type {
  CreateMediaWikiAccountRequest,
  CreateMediaWikiAccountResult,
  MediaWikiAccount,
  MediaWikiAccountStatus,
  UpdateMediaWikiAccountRequest,
  UserContrib,
  UserInfo,
} from "./types";
