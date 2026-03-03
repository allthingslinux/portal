import { apikey, jwks } from "./api-keys";
import {
  account,
  passkey,
  session,
  twoFactor,
  user,
  verification,
} from "./auth";
import { integrationAccount } from "./integrations/base";
import { ircAccount } from "./irc";
import { mailcowAccount } from "./mailcow";
import {
  oauthAccessToken,
  oauthClient,
  oauthConsent,
  oauthRefreshToken,
} from "./oauth";
import { xmppAccount } from "./xmpp";
export const schema = {
  user,
  session,
  account,
  verification,
  passkey,
  twoFactor,
  apikey,
  oauthClient,
  oauthConsent,
  oauthAccessToken,
  oauthRefreshToken,
  jwks,
  integrationAccount,
  ircAccount,
  mailcowAccount,
  xmppAccount,
};
