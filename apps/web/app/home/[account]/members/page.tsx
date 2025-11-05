import { PlusCircle } from 'lucide-react';

import {
  AccountInvitationsTable,
  AccountMembersTable,
  InviteMembersDialogContainer,
} from '@portal/team-accounts/components';
import { AppBreadcrumbs } from '@portal/ui/app-breadcrumbs';
import { Button } from '@portal/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@portal/ui/card';
import { If } from '@portal/ui/if';
import { PageBody } from '@portal/ui/page';
import { Trans } from '@portal/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

// local imports
import { TeamAccountLayoutPageHeader } from '../_components/team-account-layout-page-header';
import { loadMembersPageData } from './_lib/server/members-page.loader';

interface TeamAccountMembersPageProps {
  params: Promise<{ account: string }>;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('teams:members.pageTitle');

  return {
    title,
  };
};

async function TeamAccountMembersPage({ params }: TeamAccountMembersPageProps) {
  const slug = (await params).account;

  const [members, invitations, canAddMember, { user, account }] =
    await loadMembersPageData(slug);

  const canManageRoles = account.permissions.includes('roles.manage');
  const canManageInvitations = account.permissions.includes('invites.manage');

  const isPrimaryOwner = account.primary_owner_user_id === user.id;
  const currentUserRoleHierarchy = account.role_hierarchy_level;

  return (
    <>
      <TeamAccountLayoutPageHeader
        title={<Trans i18nKey={'common:routes.members'} />}
        description={<AppBreadcrumbs />}
        account={account.slug}
      />

      <PageBody>
        <div className={'flex w-full max-w-4xl flex-col space-y-4 pb-32'}>
          <Card>
            <CardHeader className={'flex flex-row justify-between'}>
              <div className={'flex flex-col space-y-1.5'}>
                <CardTitle>
                  <Trans i18nKey={'common:accountMembers'} />
                </CardTitle>

                <CardDescription>
                  <Trans i18nKey={'common:membersTabDescription'} />
                </CardDescription>
              </div>

              <If condition={canManageInvitations && canAddMember}>
                <InviteMembersDialogContainer
                  userRoleHierarchy={currentUserRoleHierarchy}
                  accountSlug={account.slug}
                >
                  <Button size={'sm'} data-test={'invite-members-form-trigger'}>
                    <PlusCircle className={'mr-2 w-4'} />

                    <span>
                      <Trans i18nKey={'teams:inviteMembersButton'} />
                    </span>
                  </Button>
                </InviteMembersDialogContainer>
              </If>
            </CardHeader>

            <CardContent>
              <AccountMembersTable
                userRoleHierarchy={currentUserRoleHierarchy}
                currentUserId={user.id}
                currentAccountId={account.id}
                members={members}
                isPrimaryOwner={isPrimaryOwner}
                canManageRoles={canManageRoles}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className={'flex flex-row justify-between'}>
              <div className={'flex flex-col space-y-1.5'}>
                <CardTitle>
                  <Trans i18nKey={'teams:pendingInvitesHeading'} />
                </CardTitle>

                <CardDescription>
                  <Trans i18nKey={'teams:pendingInvitesDescription'} />
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <AccountInvitationsTable
                permissions={{
                  canUpdateInvitation: canManageRoles,
                  canRemoveInvitation: canManageRoles,
                  currentUserRoleHierarchy,
                }}
                invitations={invitations}
              />
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(TeamAccountMembersPage);
