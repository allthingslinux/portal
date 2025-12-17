"use client";

import featuresFlagConfig from "~/config/feature-flags.config";
import pathsConfig from "~/config/paths.config";
import { useSession, useSignOut } from "~/core/auth/better-auth/hooks";
import type { BetterAuthUser } from "~/core/auth/better-auth/types";
import { PersonalAccountDropdown } from "~/features/accounts/components/personal-account-dropdown";

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

  return (
    <PersonalAccountDropdown
      account={props.account}
      className={"w-full"}
      features={features}
      paths={paths}
      showProfileName={props.showProfileName}
      signOutRequested={() => signOut.mutateAsync()}
      user={userData}
    />
  );
}
