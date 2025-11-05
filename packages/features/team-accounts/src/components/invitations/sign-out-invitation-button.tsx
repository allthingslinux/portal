'use client';

import { useSignOut } from '@portal/supabase/hooks/use-sign-out';
import { Button } from '@portal/ui/button';
import { Trans } from '@portal/ui/trans';

export function SignOutInvitationButton(
  props: React.PropsWithChildren<{
    nextPath: string;
  }>,
) {
  const signOut = useSignOut();

  return (
    <Button
      variant={'ghost'}
      onClick={async () => {
        await signOut.mutateAsync();
        window.location.assign(props.nextPath);
      }}
    >
      <Trans i18nKey={'teams:signInWithDifferentAccount'} />
    </Button>
  );
}
