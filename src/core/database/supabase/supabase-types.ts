/**
 * Local type definitions to replace @supabase/supabase-js imports
 * These are kept for backward compatibility
 */

export type SignInWithPasswordCredentials = {
  email: string;
  password: string;
  options?: {
    captchaToken?: string;
    emailRedirectTo?: string;
  };
};

export type SignInWithOAuthCredentials = {
  provider: string;
  options?: {
    redirectTo?: string;
    scopes?: string;
    queryParams?: Record<string, string>;
  };
};

export type SignInWithPasswordlessCredentials = {
  email?: string;
  phone?: string;
  options?: {
    emailRedirectTo?: string;
    captchaToken?: string;
    shouldCreateUser?: boolean;
  };
};

export type Provider =
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

export type VerifyOtpParams = {
  token: string;
  type:
    | "email"
    | "phone"
    | "sms"
    | "magiclink"
    | "recovery"
    | "invite"
    | "signup";
  options?: {
    emailRedirectTo?: string;
  };
};

export type EmailOtpType =
  | "signup"
  | "email"
  | "email_change"
  | "recovery"
  | "invite";
