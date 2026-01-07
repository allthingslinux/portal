import { GalleryVerticalEnd } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";

import { FieldDescription } from "@/components/ui/field";
import { createPageMetadata } from "@/lib/navigation/metadata";

// ============================================================================
// Metadata Generation
// ============================================================================

const authPageMetadata: Record<string, { title: string; description: string }> =
  {
    "sign-in": {
      title: "Sign In",
      description: "Sign in to your All Things Linux account.",
    },
    "sign-up": {
      title: "Sign Up",
      description: "Create a new All Things Linux account.",
    },
    "forgot-password": {
      title: "Forgot Password",
      description: "Reset your password for your All Things Linux account.",
    },
    "reset-password": {
      title: "Reset Password",
      description: "Reset your password using the verification link.",
    },
    "two-factor": {
      title: "Two-Factor Authentication",
      description: "Complete two-factor authentication to sign in.",
    },
    "magic-link": {
      title: "Magic Link",
      description: "Sign in using a magic link sent to your email.",
    },
    "recover-account": {
      title: "Recover Account",
      description: "Recover access to your All Things Linux account.",
    },
    "sign-out": {
      title: "Sign Out",
      description: "Sign out of your All Things Linux account.",
    },
    callback: {
      title: "Authentication Callback",
      description: "Completing authentication...",
    },
  };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string }>;
}): Promise<Metadata> {
  const { path } = await params;
  const pageMeta = authPageMetadata[path] || {
    title: "Authentication",
    description: "All Things Linux authentication",
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

const SIGN_IN_LOCALIZATION = {
  SIGN_IN: "Welcome back",
  SIGN_IN_DESCRIPTION: "Sign in to your account",
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

function getLocalization(path: string) {
  return path === "sign-in" ? SIGN_IN_LOCALIZATION : undefined;
}

// ============================================================================
// Components
// ============================================================================

function BrandLink() {
  return (
    <Link className="flex items-center gap-2 self-center font-medium" href="/">
      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <GalleryVerticalEnd className="size-4" />
      </div>
      Portal V2
    </Link>
  );
}

function TermsDisclaimer() {
  return (
    <FieldDescription className="px-6 text-center">
      By clicking continue, you agree to our{" "}
      <Link className="underline underline-offset-4" href="/terms">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link className="underline underline-offset-4" href="/privacy">
        Privacy Policy
      </Link>
      .
    </FieldDescription>
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
        <AuthView
          classNames={AUTH_VIEW_CLASS_NAMES}
          localization={getLocalization(path)}
          path={path}
        />
        {shouldShowDisclaimer(path) && <TermsDisclaimer />}
      </div>
    </div>
  );
}
