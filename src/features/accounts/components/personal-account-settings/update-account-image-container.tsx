"use client";

import { AccountImageUploader } from "~/shared/components/account-image-uploader";

import { useRevalidatePersonalAccountDataQuery } from "../../hooks/use-personal-account-data";
import { updateAccountPictureUrlAction } from "../../server/personal-accounts-server-actions";

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
