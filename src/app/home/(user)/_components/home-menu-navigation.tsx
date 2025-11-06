import {
  BorderedNavigationMenu,
  BorderedNavigationMenuItem,
} from '~/components/makerkit/bordered-navigation-menu';
import { If } from '~/components/makerkit/if';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import featuresFlagConfig from '~/config/feature-flags.config';
import { personalAccountNavigationConfig } from '~/config/personal-account-navigation.config';

// home imports
import { HomeAccountSelector } from '../_components/home-account-selector';
import { UserNotifications } from '../_components/user-notifications';
import { type UserWorkspace } from '../_lib/server/load-user-workspace';

export function HomeMenuNavigation(props: { workspace: UserWorkspace }) {
  const { workspace, user, accounts } = props.workspace;

  const routes = personalAccountNavigationConfig.routes.reduce<
    Array<{
      path: string;
      label: string;
      Icon?: React.ReactNode;
      end?: boolean | ((path: string) => boolean);
    }>
  >((acc, item) => {
    if ('children' in item) {
      return [...acc, ...item.children];
    }

    if ('divider' in item) {
      return acc;
    }

    return [...acc, item];
  }, []);

  return (
    <div className={'flex w-full flex-1 justify-between'}>
      <div className={'flex items-center space-x-8'}>
        <AppLogo />

        <BorderedNavigationMenu>
          {routes.map((route) => (
            <BorderedNavigationMenuItem {...route} key={route.path} />
          ))}
        </BorderedNavigationMenu>
      </div>

      <div className={'flex justify-end space-x-2.5'}>
        <UserNotifications userId={user.id} />

        <If condition={featuresFlagConfig.enableTeamAccounts}>
          <HomeAccountSelector userId={user.id} accounts={accounts} />
        </If>

        <div>
          <ProfileAccountDropdownContainer
            user={user}
            account={workspace}
            showProfileName={false}
          />
        </div>
      </div>
    </div>
  );
}
