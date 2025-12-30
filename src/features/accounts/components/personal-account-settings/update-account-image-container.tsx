"use client";

import { AccountImageUploader } from "~/components/account-image-uploader";
import { updateAccountPictureUrlAction } from "~/features/accounts/server/personal-accounts-server-actions";
import { useRevalidatePersonalAccountDataQuery } from "~/hooks/use-personal-account-data";

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
      onSuccess={() => revalidateUserDataQuery(user.id)}
      onUpdate={(pictureUrl) =>
        updateAccountPictureUrlAction({ accountId: user.id, pictureUrl })
      }
      pictureUrl={user.pictureUrl ?? null}
      translationNamespace="account"
    />
  );
}
