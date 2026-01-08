import { GalleryVerticalEnd } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import { getMessages, getTranslations } from "next-intl/server";

import { createPageMetadata } from "@/lib/seo";

// ============================================================================
// Metadata Generation
// ============================================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string }>;
}): Promise<Metadata> {
  const { path } = await params;
  const t = await getTranslations();

  const authPageMetadata: Record<
    string,
    { title: string; description: string }
  > = {
    "sign-in": {
      title: t("auth.signIn"),
      description: t("auth.signInToAccount"),
    },
    "sign-up": {
      title: t("auth.signUp"),
      description: t("auth.createAccount"),
    },
    "forgot-password": {
      title: t("auth.forgotPassword"),
      description: t("auth.resetPasswordDescription"),
    },
    "reset-password": {
      title: t("auth.resetPassword"),
      description: t("auth.resetPasswordLink"),
    },
    "two-factor": {
      title: t("auth.twoFactor"),
      description: t("auth.completeTwoFactor"),
    },
    "magic-link": {
      title: t("auth.magicLink"),
      description: t("auth.magicLinkDescription"),
    },
    "recover-account": {
      title: t("auth.recoverAccount"),
      description: t("auth.recoverAccountDescription"),
    },
    "sign-out": {
      title: t("auth.signOut"),
      description: t("auth.signOutDescription"),
    },
    callback: {
      title: t("auth.callback"),
      description: t("auth.completingAuth"),
    },
  };

  const pageMeta = authPageMetadata[path] || {
    title: t("auth.defaultTitle"),
    description: t("auth.defaultDescription"),
  };

  return createPageMetadata({
    title: pageMeta.title,
    description: pageMeta.description,
    robots: {
      index: false,
      follow: false,
    },
  });
}

// ============================================================================
// Constants
// ============================================================================

const PATHS_WITHOUT_DISCLAIMER = [
  "callback",
  "sign-out",
  "reset-password",
  "forgot-password",
] as const;

const AUTH_VIEW_CLASS_NAMES = {
  header: "text-center",
  title: "text-xl",
  description: "text-sm",
  form: {
    button: "w-full",
    providerButton: "w-full",
  },
} as const;

// ============================================================================
// Static Generation
// ============================================================================

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

// ============================================================================
// Helper Functions
// ============================================================================

function shouldShowDisclaimer(path: string): boolean {
  return !PATHS_WITHOUT_DISCLAIMER.includes(
    path as (typeof PATHS_WITHOUT_DISCLAIMER)[number]
  );
}

// ============================================================================
// Components
// ============================================================================

async function BrandLink() {
  const t = await getTranslations();
  return (
    <Link className="flex items-center gap-2 self-center font-medium" href="/">
      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <GalleryVerticalEnd className="size-4" />
      </div>
      {t("auth.brandName")}
    </Link>
  );
}

const PLACEHOLDER_REGEX = /({terms}|{privacy})/;

async function TermsDisclaimer() {
  const t = await getTranslations();
  const messages = await getMessages();

  // Get raw message string without formatting
  const disclaimer = (messages.auth as { termsDisclaimer: string })
    .termsDisclaimer as string;
  const termsText = t("auth.termsOfService");
  const privacyText = t("auth.privacyPolicy");

  // Simple string replacement approach - t.rich() doesn't work reliably
  // with getTranslations() in Server Components when passed to Client Components
  const termsLink = (
    <Link
      className="underline underline-offset-4"
      href="https://www.iubenda.com/terms-and-conditions/97069484"
    >
      {termsText}
    </Link>
  );
  const privacyLink = (
    <Link
      className="underline underline-offset-4"
      href="https://www.iubenda.com/privacy-policy/97069484/full-legal"
    >
      {privacyText}
    </Link>
  );

  // Split by placeholders and reconstruct with links
  const parts = disclaimer.split(PLACEHOLDER_REGEX);

  return (
    <p className="px-6 text-center font-normal text-muted-foreground text-sm leading-normal [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4">
      {parts.map((part, index) => {
        const key = `${part}-${index}`;
        if (part === "{terms}") {
          return <span key={key}>{termsLink}</span>;
        }
        if (part === "{privacy}") {
          return <span key={key}>{privacyLink}</span>;
        }
        return <span key={key}>{part}</span>;
      })}
    </p>
  );
}

// ============================================================================
// Page Component
// ============================================================================
// This page handles all authentication views dynamically using Better Auth UI.
// See: https://better-auth-ui.com/llms.txt
//
// Supported paths (from authViewPaths):
//   - sign-in: Sign in page
//   - sign-up: Sign up page
//   - forgot-password: Password reset request
//   - reset-password: Password reset form
//   - two-factor: Two-factor authentication
//   - magic-link: Magic link authentication
//   - recover-account: Account recovery
//   - sign-out: Sign out confirmation
//   - callback: OAuth callback handler

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <BrandLink />
        <AuthView classNames={AUTH_VIEW_CLASS_NAMES} path={path} />
        {shouldShowDisclaimer(path) && <TermsDisclaimer />}
      </div>
    </div>
  );
}
