import { PlusCircle } from "lucide-react";
import { AppBreadcrumbs } from "~/components/portal/app-breadcrumbs";
import { If } from "~/components/portal/if";
import { PageBody } from "~/components/portal/page";
import { Trans } from "~/components/portal/trans";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AccountInvitationsTable } from "~/features/team-accounts/components/invitations/account-invitations-table";
import { AccountMembersTable } from "~/features/team-accounts/components/members/account-members-table";
import { InviteMembersDialogContainer } from "~/features/team-accounts/components/members/invite-members-dialog-container";

import { createI18nServerInstance } from "~/shared/lib/i18n/i18n.server";
import { withI18n } from "~/shared/lib/i18n/with-i18n";

import { TeamAccountLayoutPageHeader } from "../_components/team-account-layout-page-header";
import { loadMembersPageData } from "./_lib/server/members-page.loader";

type TeamAccountMembersPageProps = {
  params: Promise<{ account: string }>;
};

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t("teams:members.pageTitle");

  return {
    title,
  };
};

async function TeamAccountMembersPage({ params }: TeamAccountMembersPageProps) {
  const slug = (await params).account;

  const [members, invitations, canAddMember, { user, account }] =
    await loadMembersPageData(slug);

  const canManageRoles = account.permissions.includes("roles.manage");
  const canManageInvitations = account.permissions.includes("invites.manage");

  const isPrimaryOwner = account.primary_owner_user_id === user.id;
  const currentUserRoleHierarchy = account.role_hierarchy_level;

  return (
    <>
      <TeamAccountLayoutPageHeader
        account={account.slug ?? ""}
        description={<AppBreadcrumbs />}
        title={<Trans i18nKey={"common:routes.members"} />}
      />

      <PageBody>
        <div className={"flex w-full max-w-4xl flex-col space-y-4 pb-32"}>
          <Card>
            <CardHeader className={"flex flex-row justify-between"}>
              <div className={"flex flex-col space-y-1.5"}>
                <CardTitle>
                  <Trans i18nKey={"common:accountMembers"} />
                </CardTitle>

                <CardDescription>
                  <Trans i18nKey={"common:membersTabDescription"} />
                </CardDescription>
              </div>

              <If condition={canManageInvitations && canAddMember}>
                <InviteMembersDialogContainer
                  accountSlug={account.slug ?? ""}
                  userRoleHierarchy={currentUserRoleHierarchy}
                >
                  <Button data-test={"invite-members-form-trigger"} size={"sm"}>
                    <PlusCircle className={"mr-2 w-4"} />

                    <span>
                      <Trans i18nKey={"teams:inviteMembersButton"} />
                    </span>
                  </Button>
                </InviteMembersDialogContainer>
              </If>
            </CardHeader>

            <CardContent>
              <AccountMembersTable
                canManageRoles={canManageRoles}
                currentAccountId={account.id}
                currentUserId={user.id}
                isPrimaryOwner={isPrimaryOwner}
                members={members}
                userRoleHierarchy={currentUserRoleHierarchy}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className={"flex flex-row justify-between"}>
              <div className={"flex flex-col space-y-1.5"}>
                <CardTitle>
                  <Trans i18nKey={"teams:pendingInvitesHeading"} />
                </CardTitle>

                <CardDescription>
                  <Trans i18nKey={"teams:pendingInvitesDescription"} />
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <AccountInvitationsTable
                invitations={invitations}
                permissions={{
                  canUpdateInvitation: canManageRoles,
                  canRemoveInvitation: canManageRoles,
                  currentUserRoleHierarchy,
                }}
              />
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(TeamAccountMembersPage);
