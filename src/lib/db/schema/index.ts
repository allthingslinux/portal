import { apikey, jwks } from "./api-keys";
import {
  account,
  passkey,
  session,
  twoFactor,
  user,
  verification,
} from "./auth";
import {
  oauthAccessToken,
  oauthClient,
  oauthConsent,
  oauthRefreshToken,
} from "./oauth";
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
};
