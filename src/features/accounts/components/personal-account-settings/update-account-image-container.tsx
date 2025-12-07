'use client';

import { AccountImageUploader } from '~/shared/components/account-image-uploader';

import { useRevalidatePersonalAccountDataQuery } from '../../hooks/use-personal-account-data';
import { updateAccountPictureUrlAction } from '../../server/personal-accounts-server-actions';

export function UpdateAccountImageContainer({
  user,
}: {
  user: {
    pictureUrl: string | null;
    id: string;
  };
}) {
  const revalidateUserDataQuery = useRevalidatePersonalAccountDataQuery();

  return (
    <AccountImageUploader
      accountId={user.id}
      pictureUrl={user.pictureUrl ?? null}
      onUpdate={(pictureUrl) => updateAccountPictureUrlAction(user.id, pictureUrl)}
      translationNamespace="account"
      onSuccess={() => revalidateUserDataQuery(user.id)}
    />
  );
}
