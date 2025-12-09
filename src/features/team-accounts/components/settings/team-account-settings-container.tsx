"use client";

import { Trans } from "~/components/makerkit/trans";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { TeamAccountDangerZone } from "./team-account-danger-zone";
import { UpdateTeamAccountImage } from "./update-team-account-image-container";
import { UpdateTeamAccountNameForm } from "./update-team-account-name-form";

export function TeamAccountSettingsContainer(props: {
  account: {
    name: string;
    slug: string;
    id: string;
    pictureUrl: string | null;
    primaryOwnerUserId: string;
  };

  paths: {
    teamAccountSettings: string;
  };

  features: {
    enableTeamDeletion: boolean;
  };
}) {
  return (
    <div className={"flex w-full flex-col space-y-4"}>
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={"teams:settings.teamLogo"} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={"teams:settings.teamLogoDescription"} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateTeamAccountImage account={props.account} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={"teams:settings.teamName"} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={"teams:settings.teamNameDescription"} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateTeamAccountNameForm
            account={props.account}
            path={props.paths.teamAccountSettings}
          />
        </CardContent>
      </Card>

      <TeamAccountDangerZone
        account={props.account}
        features={props.features}
        primaryOwnerUserId={props.account.primaryOwnerUserId}
      />
    </div>
  );
}
