"use client";

import { AccountImageUploader } from "~/shared/components/account-image-uploader";

import { updateTeamAccountPictureUrlAction } from "../../server/actions/team-account-server-actions";

export function UpdateTeamAccountImage(props: {
  account: {
    id: string;
    name: string;
    pictureUrl: string | null;
  };
}) {
  return (
    <AccountImageUploader
      accountId={props.account.id}
      onUpdate={(pictureUrl) =>
        updateTeamAccountPictureUrlAction(props.account.id, pictureUrl)
      }
      pictureUrl={props.account.pictureUrl}
      translationNamespace="teams"
    />
  );
}
