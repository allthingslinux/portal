"use client";

import { useFormStatus } from "react-dom";
import { Trans } from "~/components/makerkit/trans";
import { Button } from "~/components/ui/button";

export function InvitationSubmitButton(props: {
  accountName: string;
  email: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button className={"w-full"} disabled={pending} type={"submit"}>
      <Trans
        i18nKey={pending ? "teams:joiningTeam" : "teams:continueAs"}
        values={{
          accountName: props.accountName,
          email: props.email,
        }}
      />
    </Button>
  );
}
