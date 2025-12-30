"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { PersonalAccountDropdown } from "~/components/features/personal-account-dropdown";
import { If } from "~/components/if";
import { Trans } from "~/components/trans";
import { Button } from "~/components/ui/button";
import { useSignOut } from "~/hooks/use-sign-out";
import type { BetterAuthUser } from "~/lib/auth/types";
import featuresFlagConfig from "~/lib/config/feature-flags.config";
import pathsConfig from "~/lib/config/paths.config";

const ModeToggle = dynamic(
  () =>
    import("~/components/mode-toggle").then((mod) => ({
      default: mod.ModeToggle,
    })),
  { ssr: false }
);

const MobileModeToggle = dynamic(
  () =>
    import("~/components/mobile-mode-toggle").then((mod) => ({
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
    <div className="fade-in flex animate-in items-center gap-x-2 duration-500">
      <div className="hidden md:flex">
        <If condition={features.enableThemeToggle}>
          <ModeToggle />
        </If>
      </div>

      <div className="md:hidden">
        <If condition={features.enableThemeToggle}>
          <MobileModeToggle />
        </If>
      </div>

      <Button
        asChild
        className="text-xs md:text-sm"
        size="sm"
        variant="default"
      >
        <Link href={pathsConfig.auth.signIn}>
          <Trans i18nKey="auth:signIn" />
        </Link>
      </Button>
    </div>
  );
}
