'use client';

import { useSession } from '~/core/auth/nextauth/hooks';
import { LoadingOverlay } from '~/components/makerkit/loading-overlay';

import { UpdatePasswordForm } from './update-password-form';

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
  }>,
) {
  const { data: user, isLoading: isPending } = useSession();

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
