import { eq } from "drizzle-orm";
import { BadgeX, Ban, ShieldPlus, VenetianMask } from "lucide-react";
import { AppBreadcrumbs } from "~/components/makerkit/app-breadcrumbs";
import { If } from "~/components/makerkit/if";
import { PageBody, PageHeader } from "~/components/makerkit/page";
import { ProfileAvatar } from "~/components/makerkit/profile-avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import {
  getDrizzleSupabaseAdminClient,
  getDrizzleSupabaseClient,
} from "~/core/database/supabase/clients/drizzle-client";
import type { Tables } from "~/core/database/supabase/database.types";
import {
  accounts,
  accountsMemberships,
  roles,
  usersInAuth,
} from "~/core/database/supabase/drizzle/schema";

import { AdminBanUserDialog } from "./admin-ban-user-dialog";
import { AdminDeleteAccountDialog } from "./admin-delete-account-dialog";
import { AdminDeleteUserDialog } from "./admin-delete-user-dialog";
import { AdminImpersonateUserDialog } from "./admin-impersonate-user-dialog";
import { AdminMembersTable } from "./admin-members-table";
import { AdminMembershipsTable } from "./admin-memberships-table";
import { AdminReactivateUserDialog } from "./admin-reactivate-user-dialog";

type Account = Tables<"accounts">;
type Membership = Tables<"accounts_memberships">;

export function AdminAccountPage(props: {
  account: Account & { memberships: Membership[] };
}) {
  const isPersonalAccount = props.account.is_personal_account;

  if (isPersonalAccount) {
    return <PersonalAccountPage account={props.account} />;
  }

  return <TeamAccountPage account={props.account} />;
}

async function PersonalAccountPage(props: { account: Account }) {
  const [memberships, _userResult] = await Promise.all([
    getMemberships(props.account.id),
    // TODO: Query user from auth.users using Drizzle
    // For now, return a placeholder
    Promise.resolve<{ user: null }>({ user: null }),
  ]);

  // TODO: Check if user is banned by querying auth.users.raw_app_meta_data
  const isBanned = false;

  return (
    <>
      <PageHeader
        className="border-b"
        description={
          <AppBreadcrumbs
            values={{
              [props.account.id]:
                props.account.name ?? props.account.email ?? "Account",
            }}
          />
        }
      >
        <div className={"flex gap-x-2.5"}>
          <If condition={isBanned}>
            <AdminReactivateUserDialog userId={props.account.id}>
              <Button
                data-test={"admin-reactivate-account-button"}
                size={"sm"}
                variant={"secondary"}
              >
                <ShieldPlus className={"mr-1 h-4"} />
                Reactivate
              </Button>
            </AdminReactivateUserDialog>
          </If>

          <If condition={!isBanned}>
            <AdminBanUserDialog userId={props.account.id}>
              <Button
                data-test={"admin-ban-account-button"}
                size={"sm"}
                variant={"secondary"}
              >
                <Ban className={"mr-1 h-3 text-destructive"} />
                Ban
              </Button>
            </AdminBanUserDialog>

            <AdminImpersonateUserDialog userId={props.account.id}>
              <Button
                data-test={"admin-impersonate-button"}
                size={"sm"}
                variant={"secondary"}
              >
                <VenetianMask className={"mr-1 h-4 text-blue-500"} />
                Impersonate
              </Button>
            </AdminImpersonateUserDialog>
          </If>

          <AdminDeleteUserDialog userId={props.account.id}>
            <Button
              data-test={"admin-delete-account-button"}
              size={"sm"}
              variant={"destructive"}
            >
              <BadgeX className={"mr-1 h-4"} />
              Delete
            </Button>
          </AdminDeleteUserDialog>
        </div>
      </PageHeader>

      <PageBody className={"space-y-6 py-4"}>
        <div className={"flex items-center justify-between"}>
          <div className={"flex items-center gap-x-4"}>
            <div className={"flex items-center gap-x-2.5"}>
              <ProfileAvatar
                displayName={props.account.name}
                pictureUrl={props.account.picture_url}
              />

              <span className={"font-semibold text-sm capitalize"}>
                {props.account.name}
              </span>
            </div>

            <Badge variant={"outline"}>Personal Account</Badge>

            <If condition={isBanned}>
              <Badge variant={"destructive"}>Banned</Badge>
            </If>
          </div>
        </div>

        <div className={"flex flex-col gap-y-8"}>
          <div className={"divider-divider-x flex flex-col gap-y-2.5"}>
            <Heading level={6}>Teams</Heading>

            <div className={"rounded-lg border p-2"}>
              <AdminMembershipsTable memberships={memberships} />
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}

async function TeamAccountPage(props: {
  account: Account & { memberships: Membership[] };
}) {
  const members = await getMembers(props.account.slug ?? "");

  return (
    <>
      <PageHeader
        className="border-b"
        description={
          <AppBreadcrumbs
            values={{
              [props.account.id]:
                props.account.name ?? props.account.email ?? "Account",
            }}
          />
        }
      >
        <AdminDeleteAccountDialog accountId={props.account.id}>
          <Button
            data-test={"admin-delete-account-button"}
            size={"sm"}
            variant={"destructive"}
          >
            <BadgeX className={"mr-1 h-4"} />
            Delete
          </Button>
        </AdminDeleteAccountDialog>
      </PageHeader>

      <PageBody className={"space-y-6 py-4"}>
        <div className={"flex justify-between"}>
          <div className={"flex items-center gap-x-4"}>
            <div className={"flex items-center gap-x-2.5"}>
              <ProfileAvatar
                displayName={props.account.name}
                pictureUrl={props.account.picture_url}
              />

              <span className={"font-semibold text-sm capitalize"}>
                {props.account.name}
              </span>
            </div>

            <Badge variant={"outline"}>Team Account</Badge>
          </div>
        </div>

        <div>
          <div className={"flex flex-col gap-y-8"}>
            <div className={"flex flex-col gap-y-2.5"}>
              <Heading level={6}>Team Members</Heading>

              <div className={"rounded-lg border p-2"}>
                <AdminMembersTable members={members} />
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}

async function getMemberships(userId: string) {
  const db = getDrizzleSupabaseAdminClient();

  const memberships = await db
    .select({
      id: accountsMemberships.id,
      userId: accountsMemberships.userId,
      accountId: accountsMemberships.accountId,
      role: accountsMemberships.accountRole,
      createdAt: accountsMemberships.createdAt,
      updatedAt: accountsMemberships.updatedAt,
      account: {
        id: accounts.id,
        name: accounts.name,
      },
    })
    .from(accountsMemberships)
    .innerJoin(accounts, eq(accounts.id, accountsMemberships.accountId))
    .where(eq(accountsMemberships.userId, userId));

  return memberships.map((m) => ({
    ...m,
    user_id: m.userId,
    account_id: m.accountId,
    role: m.role,
  })) as unknown[];
}

async function getMembers(accountSlug: string) {
  const drizzleClient = await getDrizzleSupabaseClient();

  const data = (await drizzleClient.runTransaction(async (tx) => {
    return await tx
      .select({
        userId: accountsMemberships.userId,
        accountId: accountsMemberships.accountId,
        role: accountsMemberships.accountRole,
        roleHierarchyLevel: roles.hierarchyLevel,
        primaryOwnerUserId: accounts.primaryOwnerUserId,
        name: usersInAuth.email, // Using email as name since personal accounts don't have names
        email: usersInAuth.email,
        pictureUrl: accounts.pictureUrl,
        createdAt: accountsMemberships.createdAt,
        updatedAt: accountsMemberships.updatedAt,
      })
      .from(accountsMemberships)
      .innerJoin(accounts, eq(accounts.id, accountsMemberships.accountId))
      .innerJoin(usersInAuth, eq(usersInAuth.id, accountsMemberships.userId))
      .leftJoin(roles, eq(roles.name, accountsMemberships.accountRole))
      .where(eq(accounts.slug, accountSlug));
  })) as unknown[];

  // Add generated id for components that expect it
  const dataWithId = data.map((item) => ({
    id: `${item.userId}-${item.accountId}`,
    ...item,
  }));

  return dataWithId;
}
