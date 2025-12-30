import { z } from "zod";
import { OAUTH_PROVIDERS } from "./providers.config";

const keycloakEnvConfigured =
  Boolean(process.env.KEYCLOAK_ID) &&
  Boolean(process.env.KEYCLOAK_SECRET) &&
  Boolean(process.env.KEYCLOAK_ISSUER);

if (!keycloakEnvConfigured) {
  throw new Error(
    "Keycloak is required for authentication. Set KEYCLOAK_ID, KEYCLOAK_SECRET, and KEYCLOAK_ISSUER."
  );
}

const AuthConfigSchema = z.object({
  providers: z.object({
    oAuth: z.array(z.string()),
  }),
});

const authConfig = AuthConfigSchema.parse({
  providers: {
    oAuth: OAUTH_PROVIDERS,
  },
});

export default authConfig;
