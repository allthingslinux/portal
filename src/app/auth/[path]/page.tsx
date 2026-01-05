import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";

import { FieldDescription } from "@/components/ui/field";

// ============================================================================
// Dynamic Auth Pages
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
//
// Static generation:
//   - All auth paths are pre-generated at build time for better performance
//   - dynamicParams: false ensures only valid paths are accessible

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

const shouldShowDisclaimer = (path: string) =>
  !["callback", "sign-out", "reset-password", "forgot-password"].includes(path);

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Portal V2
        </Link>
        <AuthView
          classNames={{
            header: "text-center",
            title: "text-xl",
            description: "text-sm",
            form: {
              button: "w-full",
              providerButton: "w-full",
            },
          }}
          localization={
            path === "sign-in"
              ? {
                  SIGN_IN: "Welcome back",
                  SIGN_IN_DESCRIPTION: "Sign in to your account",
                }
              : undefined
          }
          path={path}
        />
        {shouldShowDisclaimer(path) && (
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
        )}
      </div>
    </div>
  );
}
