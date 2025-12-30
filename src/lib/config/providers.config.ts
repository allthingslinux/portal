export const OAUTH_PROVIDERS = ["keycloak", "github", "discord"] as const;

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export const PROVIDER_LOGOS: Record<string, string | React.ReactNode> = {
  keycloak: "/images/oauth/keycloak.svg",
  github: "/images/oauth/github.webp",
  discord: "/images/oauth/discord.svg",
  google: "/images/oauth/google.webp",
  facebook: "/images/oauth/facebook.webp",
  microsoft: "/images/oauth/microsoft.webp",
  apple: "/images/oauth/apple.webp",
};
