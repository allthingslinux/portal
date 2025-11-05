'use client';

import { useUser } from '@portal/supabase/hooks/use-user';
import { LoadingOverlay } from '@portal/ui/loading-overlay';

import { UpdatePasswordForm } from './update-password-form';

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
  }>,
) {
  const { data: user, isPending } = useUser();

  if (isPending) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (!user?.email) {
    return null;
  }

  return (
    <UpdatePasswordForm callbackPath={props.callbackPath} email={user.email} />
  );
}
