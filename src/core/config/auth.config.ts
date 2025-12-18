import { z } from "zod";

const providers = getProviders();

const keycloakEnvConfigured =
  Boolean(process.env.KEYCLOAK_ID) &&
  Boolean(process.env.KEYCLOAK_SECRET) &&
  Boolean(process.env.KEYCLOAK_ISSUER);

if (!keycloakEnvConfigured) {
  throw new Error(
    "Keycloak is required for authentication. Set KEYCLOAK_ID, KEYCLOAK_SECRET, and KEYCLOAK_ISSUER."
  );
}

const oAuthProviders: Provider[] = ["keycloak"];

const AuthConfigSchema = z.object({
  captchaTokenSiteKey: z
    .string()
    .describe("The reCAPTCHA site key.")
    .optional(),
  displayTermsCheckbox: z
    .boolean()
    .describe("Whether to display the terms checkbox during sign-up.")
    .optional(),
  enableIdentityLinking: z
    .boolean()
    .describe("Allow linking and unlinking of auth identities.")
    .optional()
    .default(false),
  providers: z.object({
    password: z.boolean().describe("Enable password authentication."),
    oAuth: providers.array(),
  }),
});

const authConfig = AuthConfigSchema.parse({
  // NB: This is a public key, so it's safe to expose.
  captchaTokenSiteKey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,

  // whether to display the terms checkbox during sign-up
  displayTermsCheckbox:
    process.env.NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX === "true",

  // whether to enable identity linking
  enableIdentityLinking:
    process.env.NEXT_PUBLIC_AUTH_IDENTITY_LINKING === "true",

  // OAuth providers configuration
  providers: {
    password: false,
    oAuth: oAuthProviders,
  },
} satisfies z.infer<typeof AuthConfigSchema>);

export default authConfig;

type Provider =
  | "apple"
  | "azure"
  | "bitbucket"
  | "discord"
  | "facebook"
  | "figma"
  | "github"
  | "gitlab"
  | "google"
  | "kakao"
  | "keycloak"
  | "linkedin"
  | "linkedin_oidc"
  | "notion"
  | "slack"
  | "spotify"
  | "twitch"
  | "twitter"
  | "workos"
  | "zoom"
  | "fly";

function getProviders() {
  return z.enum([
    "apple",
    "azure",
    "bitbucket",
    "discord",
    "facebook",
    "figma",
    "github",
    "gitlab",
    "google",
    "kakao",
    "keycloak",
    "linkedin",
    "linkedin_oidc",
    "notion",
    "slack",
    "spotify",
    "twitch",
    "twitter",
    "workos",
    "zoom",
    "fly",
  ]) as z.ZodType<Provider>;
}
