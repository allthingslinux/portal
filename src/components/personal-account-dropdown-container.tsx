"use client";

import { PersonalAccountDropdown } from "~/components/features/personal-account-dropdown";
import { useSession } from "~/hooks/use-session";
import { useSignOut } from "~/hooks/use-sign-out";
import type { BetterAuthUser } from "~/lib/auth/types";
import featuresFlagConfig from "~/lib/config/feature-flags.config";
import pathsConfig from "~/lib/config/paths.config";

const paths = {
  home: pathsConfig.app.home,
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

export function ProfileAccountDropdownContainer(props: {
  user?: BetterAuthUser | null;
  showProfileName?: boolean;

  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  };
}) {
  const signOut = useSignOut();
  const { data: sessionData } = useSession();
  const userData = sessionData || props.user || undefined;

  if (!userData) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      // Redirect to home page after successful sign out
      window.location.href = paths.home;
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <PersonalAccountDropdown
      account={props.account}
      className={"w-full"}
      features={features}
      paths={paths}
      showProfileName={props.showProfileName}
      signOutRequested={handleSignOut}
      user={userData}
    />
  );
}
