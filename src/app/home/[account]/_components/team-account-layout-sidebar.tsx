import { JWTUserData } from '~/core/database/supabase/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '~/components/ui/sidebar';
import { cn } from '~/components/lib/utils';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components//personal-account-dropdown-container';
import { getTeamAccountSidebarConfig } from '~/config/team-account-navigation.config';
import { TeamAccountNotifications } from '~/home/[account]/_components/team-account-notifications';

import { TeamAccountAccountsSelector } from '../_components/team-account-accounts-selector';
import { TeamAccountLayoutSidebarNavigation } from './team-account-layout-sidebar-navigation';

type AccountModel = {
  label: string | null;
  value: string | null;
  image: string | null;
};

export function TeamAccountLayoutSidebar(props: {
  account: string;
  accountId: string;
  accounts: AccountModel[];
  user: JWTUserData;
}) {
  return (
    <SidebarContainer
      account={props.account}
      accountId={props.accountId}
      accounts={props.accounts}
      user={props.user}
    />
  );
}

function SidebarContainer(props: {
  account: string;
  accountId: string;
  accounts: AccountModel[];
  user: JWTUserData;
}) {
  const { account, accounts, user } = props;
  const userId = user.id;

  const config = getTeamAccountSidebarConfig(account);
  const collapsible = config.sidebarCollapsedStyle;

  return (
    <Sidebar collapsible={collapsible}>
      <SidebarHeader className={'h-16 justify-center'}>
        <div className={'flex items-center justify-between gap-x-3'}>
          <AppLogo
            className={cn(
              'p-2 group-data-[minimized=true]/sidebar:max-w-full group-data-[minimized=true]/sidebar:py-0',
            )}
          />

          <div className={'group-data-[minimized=true]/sidebar:hidden'}>
            <TeamAccountNotifications
              userId={userId}
              accountId={props.accountId}
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className={`mt-5 h-[calc(100%-160px)] overflow-y-auto`}>
        <TeamAccountLayoutSidebarNavigation config={config} />
      </SidebarContent>

      <SidebarFooter className={'flex flex-col gap-2'}>
        <TeamAccountAccountsSelector
          userId={userId}
          selectedAccount={account}
          accounts={accounts}
        />

        <ProfileAccountDropdownContainer user={props.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
