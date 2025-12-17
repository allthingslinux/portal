"use client";

import { Trans } from "~/components/portal/trans";
import { Button } from "~/components/ui/button";
import { useSignOut } from "~/core/auth/better-auth/hooks";

export function SignOutInvitationButton(
  props: React.PropsWithChildren<{
    nextPath: string;
  }>
) {
  const signOut = useSignOut();

  return (
    <Button
      onClick={async () => {
        await signOut.mutateAsync();
        window.location.assign(props.nextPath);
      }}
      variant={"ghost"}
    >
      <Trans i18nKey={"teams:signInWithDifferentAccount"} />
    </Button>
  );
}
