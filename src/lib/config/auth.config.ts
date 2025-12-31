import { env } from "../../env";
import { OAUTH_PROVIDERS } from "./providers.config";

const authConfig = {
  providers: {
    oAuth: OAUTH_PROVIDERS,
  },
  keycloak: {
    id: env.KEYCLOAK_ID,
    secret: env.KEYCLOAK_SECRET,
    issuer: env.KEYCLOAK_ISSUER,
  },
};

export default authConfig;
