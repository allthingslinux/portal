'use client';

import { useState } from 'react';

import { CreateTeamAccountDialog } from '@portal/team-accounts/components';
import { Button } from '@portal/ui/button';
import { Trans } from '@portal/ui/trans';

export function HomeAddAccountButton(props: { className?: string }) {
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  return (
    <>
      <Button
        className={props.className}
        onClick={() => setIsAddingAccount(true)}
      >
        <Trans i18nKey={'account:createTeamButtonLabel'} />
      </Button>

      <CreateTeamAccountDialog
        isOpen={isAddingAccount}
        setIsOpen={setIsAddingAccount}
      />
    </>
  );
}
