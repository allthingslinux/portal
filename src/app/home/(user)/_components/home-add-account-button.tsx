"use client";

import { useState } from "react";
import { Trans } from "~/components/makerkit/trans";
import { Button } from "~/components/ui/button";
import { CreateTeamAccountDialog } from "~/features/team-accounts/components";

export function HomeAddAccountButton(props: { className?: string }) {
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  return (
    <>
      <Button
        className={props.className}
        onClick={() => setIsAddingAccount(true)}
      >
        <Trans i18nKey={"account:createTeamButtonLabel"} />
      </Button>

      <CreateTeamAccountDialog
        isOpen={isAddingAccount}
        setIsOpen={setIsAddingAccount}
      />
    </>
  );
}
