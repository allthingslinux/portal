"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { If } from "~/components/portal/if";
import { Trans } from "~/components/portal/trans";
import { Button } from "~/components/ui/button";
import featuresFlagConfig from "~/config/feature-flags.config";
import pathsConfig from "~/config/paths.config";
import { useSignOut } from "~/core/auth/better-auth/hooks";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";
import { PersonalAccountDropdown } from "~/features/accounts/components/personal-account-dropdown";

const ModeToggle = dynamic(
  () =>
    import("~/components/portal/mode-toggle").then((mod) => ({
      default: mod.ModeToggle,
    })),
  { ssr: false }
);

const MobileModeToggle = dynamic(
  () =>
    import("~/components/portal/mobile-mode-toggle").then((mod) => ({
      default: mod.MobileModeToggle,
    })),
  { ssr: false }
);

const paths = {
  home: pathsConfig.app.home,
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

export function SiteHeaderAccountSection({
  user,
}: {
  user: BetterAuthUser | null;
}) {
  const signOut = useSignOut();

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      // Redirect to home page after successful sign out
      window.location.href = pathsConfig.app.home;
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (user) {
    return (
      <PersonalAccountDropdown
        features={features}
        paths={paths}
        showProfileName={false}
        signOutRequested={handleSignOut}
        user={user}
      />
    );
  }

  return <AuthButtons />;
}

function AuthButtons() {
  return (
    <div
      className={"fade-in flex animate-in items-center gap-x-2 duration-500"}
    >
      <div className={"hidden md:flex"}>
        <If condition={features.enableThemeToggle}>
          <ModeToggle />
        </If>
      </div>

      <div className={"md:hidden"}>
        <If condition={features.enableThemeToggle}>
          <MobileModeToggle />
        </If>
      </div>

      <div className={"flex items-center gap-x-2"}>
        <Button
          asChild
          className={"hidden md:flex md:text-sm"}
          size={"sm"}
          variant={"outline"}
        >
          <Link href={pathsConfig.auth.signIn}>
            <Trans i18nKey={"auth:signIn"} />
          </Link>
        </Button>

        <Button
          asChild
          className="text-xs md:text-sm"
          size={"sm"}
          variant={"default"}
        >
          <Link href={pathsConfig.auth.signUp}>
            <Trans i18nKey={"auth:signUp"} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
