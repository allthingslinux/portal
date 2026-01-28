import { Suspense } from "react";
import { GalleryVerticalEnd } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import { getMessages, getTranslations } from "next-intl/server";

import { Skeleton } from "@/components/ui/skeleton";
import { createPageMetadata } from "@/shared/seo";

// ============================================================================
// Metadata Generation
// ============================================================================
// Static metadata is required with cacheComponents: generateMetadata cannot
// use connection()/getTranslations() during build-time validation when
// generateStaticParams returns paths. Per-path i18n titles would need a
// layout or request-time-only mechanism.
export const metadata: Metadata = createPageMetadata({
  title: "Authentication",
  description: "Sign in or manage your account.",
  robots: {
    index: false,
    follow: false,
  },
});

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
// With cacheComponents, generateStaticParams must return at least one path for
// build-time validation. Page body defers uncached work to AuthPageContent
// inside Suspense; metadata is static above.
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

/** Static fallback shown while AuthPageContent (connection + i18n) resolves. */
function AuthPageSkeleton() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <Skeleton className="size-6 rounded-md" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

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
// With cacheComponents, all uncached data (connection, params, getTranslations)
// lives inside AuthPageContent, which is wrapped in Suspense so the segment
// shell can be statically prerendered and only the inner tree runs at request time.
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

async function AuthPageContent({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  await connection();
  const { path } = await params;

  return (
    <>
      <BrandLink />
      <AuthView classNames={AUTH_VIEW_CLASS_NAMES} path={path} />
      {shouldShowDisclaimer(path) && <TermsDisclaimer />}
    </>
  );
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Suspense fallback={<AuthPageSkeleton />}>
          <AuthPageContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
