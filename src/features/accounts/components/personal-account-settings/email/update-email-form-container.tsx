'use client';

import { useUser } from '~/core/database/supabase/hooks/use-user';
import { LoadingOverlay } from '~/components/makerkit/loading-overlay';

import { UpdateEmailForm } from './update-email-form';

export function UpdateEmailFormContainer(props: { callbackPath: string }) {
  const { data: user, isPending } = useUser();

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
