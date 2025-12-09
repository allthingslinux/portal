import { z } from "zod";

const providers = getProviders();

const keycloakEnvConfigured =
  Boolean(process.env.KEYCLOAK_ID) &&
  Boolean(process.env.KEYCLOAK_SECRET) &&
  Boolean(process.env.KEYCLOAK_ISSUER);

const oAuthProviders: Provider[] = keycloakEnvConfigured ? ["keycloak"] : [];

const AuthConfigSchema = z.object({
  captchaTokenSiteKey: z
    .string({
      description: "The reCAPTCHA site key.",
    })
    .optional(),
  displayTermsCheckbox: z
    .boolean({
      description: "Whether to display the terms checkbox during sign-up.",
    })
    .optional(),
  enableIdentityLinking: z
    .boolean({
      description: "Allow linking and unlinking of auth identities.",
    })
    .optional()
    .default(false),
  providers: z.object({
    password: z.boolean({
      description: "Enable password authentication.",
    }),
    magicLink: z.boolean({
      description: "Enable magic link authentication.",
    }),
    oAuth: providers.array(),
  }),
});

const authConfig = AuthConfigSchema.parse({
  // NB: This is a public key, so it's safe to expose.
  // Copy the value from the Supabase Dashboard.
  captchaTokenSiteKey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,

  // whether to display the terms checkbox during sign-up
  displayTermsCheckbox:
    process.env.NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX === "true",

  // whether to enable identity linking:
  // This needs to be enabled in the Supabase Console as well for it to work.
  enableIdentityLinking:
    process.env.NEXT_PUBLIC_AUTH_IDENTITY_LINKING === "true",

  // NB: Enable the providers below in the Supabase Console
  // in your production project
  providers: {
    password: process.env.NEXT_PUBLIC_AUTH_PASSWORD === "true",
    magicLink: process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK === "true",
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
