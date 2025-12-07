'use client';

import { useSession } from '~/core/auth/nextauth/hooks';
import { LoadingOverlay } from '~/components/makerkit/loading-overlay';

import { UpdateEmailForm } from './update-email-form';

export function UpdateEmailFormContainer(props: { callbackPath: string }) {
  const { data: user, isLoading: isPending } = useSession();

  if (isPending) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (!user || !user.email) {
    return null;
  }

  return (
    <UpdateEmailForm callbackPath={props.callbackPath} email={user.email} />
  );
}
