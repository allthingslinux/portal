import Image from "next/image";
import { If } from "~/components/portal/if";
import { Trans } from "~/components/portal/trans";
import { Heading } from "~/components/ui/heading";
import { Separator } from "~/components/ui/separator";

import { acceptInvitationAction } from "../../server/actions/team-invitations-server-actions";
import { InvitationSubmitButton } from "./invitation-submit-button";
import { SignOutInvitationButton } from "./sign-out-invitation-button";

export function AcceptInvitationContainer(props: {
  inviteToken: string;
  email: string;

  invitation: {
    id: string;

    account: {
      name: string;
      id: string;
      pictureUrl: string | null;
    };
  };

  paths: {
    signOutNext: string;
    nextPath: string;
  };
}) {
  return (
    <div className={"flex flex-col items-center space-y-4"}>
      <Heading className={"text-center"} level={4}>
        <Trans
          i18nKey={"teams:acceptInvitationHeading"}
          values={{
            accountName: props.invitation.account.name,
          }}
        />
      </Heading>

      <If condition={props.invitation.account.pictureUrl}>
        {(url) => (
          <Image
            alt={"Logo"}
            className={"object-cover"}
            height={64}
            src={url}
            width={64}
          />
        )}
      </If>

      <div className={"text-center text-muted-foreground text-sm"}>
        <Trans
          i18nKey={"teams:acceptInvitationDescription"}
          values={{
            accountName: props.invitation.account.name,
          }}
        />
      </div>

      <div className={"flex flex-col space-y-4"}>
        <form
          action={acceptInvitationAction}
          className={"w-full"}
          data-test={"join-team-form"}
        >
          <input name={"inviteToken"} type="hidden" value={props.inviteToken} />

          <input
            name={"nextPath"}
            type={"hidden"}
            value={props.paths.nextPath}
          />

          <InvitationSubmitButton
            accountName={props.invitation.account.name}
            email={props.email}
          />
        </form>

        <Separator />

        <SignOutInvitationButton nextPath={props.paths.signOutNext} />

        <span className={"text-center text-muted-foreground text-xs"}>
          <Trans i18nKey={"teams:signInWithDifferentAccountDescription"} />
        </span>
      </div>
    </div>
  );
}
