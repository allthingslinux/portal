import { eq } from "drizzle-orm";
import { BadgeX, Ban, ShieldPlus, VenetianMask } from "lucide-react";
import { AppBreadcrumbs } from "~/components/app-breadcrumbs";
import { If } from "~/components/if";
import { PageBody, PageHeader } from "~/components/page";
import { ProfileAvatar } from "~/components/profile-avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { db } from "~/lib/database/client";
import { accounts, accountsMemberships } from "~/lib/database/schema";

import { AdminBanUserDialog } from "./admin-ban-user-dialog";
import { AdminDeleteUserDialog } from "./admin-delete-user-dialog";
import { AdminImpersonateUserDialog } from "./admin-impersonate-user-dialog";
import { AdminMembershipsTable } from "./admin-memberships-table";
import { AdminReactivateUserDialog } from "./admin-reactivate-user-dialog";

type Account = typeof accounts.$inferSelect;
type Membership = typeof accountsMemberships.$inferSelect;
type MembershipWithAccount = {
  id: string;
  user_id: string;
  account_id: string;
  account_role: string;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  account: {
    id: string;
    name: string;
  };
};

export function AdminAccountPage(props: {
  account: Account & { memberships: Membership[] };
}) {
  // All accounts are personal accounts now
  return <PersonalAccountPage account={props.account} />;
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
                pictureUrl={props.account.pictureUrl}
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

async function getMemberships(
  userId: string
): Promise<MembershipWithAccount[]> {
  // Using shared Drizzle client

  const memberships = await db
    .select({
      userId: accountsMemberships.userId,
      accountId: accountsMemberships.accountId,
      accountRole: accountsMemberships.accountRole,
      createdAt: accountsMemberships.createdAt,
      updatedAt: accountsMemberships.updatedAt,
      createdBy: accountsMemberships.createdBy,
      updatedBy: accountsMemberships.updatedBy,
      account: {
        id: accounts.id,
        name: accounts.name,
      },
    })
    .from(accountsMemberships)
    .innerJoin(accounts, eq(accounts.id, accountsMemberships.accountId))
    .where(eq(accountsMemberships.userId, userId));

  return memberships.map((m) => ({
    id: `${m.userId}-${m.accountId}`,
    user_id: m.userId,
    account_id: m.accountId,
    account_role: m.accountRole,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
    created_by: m.createdBy ?? null,
    updated_by: m.updatedBy ?? null,
    account: {
      id: m.account.id,
      name: m.account.name,
    },
  }));
}
