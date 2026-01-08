import type { Metadata } from "next";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return createPageMetadata({
    title: t("marketing.homePage.metadataTitle"),
    description: t("marketing.homePage.metadataDescription"),
  });
}

// ============================================================================
// Home Page
// ============================================================================
// This page uses Better Auth UI components for conditional rendering based on
// authentication state. See: https://better-auth-ui.com/llms.txt
//
// Components:
//   - SignedOut: Renders content only when user is not authenticated
//   - SignedIn: Renders content only when user is authenticated
//   - UserButton: Complete user menu component with:
//     - User avatar
//     - Dropdown menu with account options
//     - Sign out functionality
//     - Settings link
//     - Profile information
//
// Alternative: You can use authClient.useSession() hook for more control:
//   const { data: session } = authClient.useSession();
//   if (!session) { ... } else { ... }

export default async function Page() {
  const t = await getTranslations();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="space-y-4 text-center">
        <h1 className="font-bold text-4xl">{t("marketing.homePage.title")}</h1>
        <p className="text-muted-foreground text-xl">
          {t("marketing.homePage.description")}
        </p>
      </div>

      <SignedOut>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/auth/sign-in">{t("navigation.signIn")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/sign-up">{t("navigation.signUp")}</Link>
          </Button>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col items-center gap-4">
          <UserButton size="icon" />
          <Button asChild>
            <Link href="/app">{t("marketing.homePage.goToDashboard")}</Link>
          </Button>
        </div>
      </SignedIn>
    </div>
  );
}
