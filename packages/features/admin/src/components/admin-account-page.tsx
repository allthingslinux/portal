import { eq } from 'drizzle-orm';
import { BadgeX, Ban, ShieldPlus, VenetianMask } from 'lucide-react';

import { Tables } from '@portal/supabase/database';
import { getDrizzleSupabaseClient } from '@portal/supabase/drizzle-client';
import {
  accounts,
  accountsMemberships,
  roles,
  usersInAuth,
} from '@portal/supabase/drizzle-schema';
import { getSupabaseServerAdminClient } from '@portal/supabase/server-admin-client';
import { getSupabaseServerClient } from '@portal/supabase/server-client';
import { Alert, AlertDescription, AlertTitle } from '@portal/ui/alert';
import { AppBreadcrumbs } from '@portal/ui/app-breadcrumbs';
import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import { Heading } from '@portal/ui/heading';
import { If } from '@portal/ui/if';
import { PageBody, PageHeader } from '@portal/ui/page';
import { ProfileAvatar } from '@portal/ui/profile-avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@portal/ui/table';

import { AdminBanUserDialog } from './admin-ban-user-dialog';
import { AdminDeleteAccountDialog } from './admin-delete-account-dialog';
import { AdminDeleteUserDialog } from './admin-delete-user-dialog';
import { AdminImpersonateUserDialog } from './admin-impersonate-user-dialog';
import { AdminMembersTable } from './admin-members-table';
import { AdminMembershipsTable } from './admin-memberships-table';
import { AdminReactivateUserDialog } from './admin-reactivate-user-dialog';

type Account = Tables<'accounts'>;
type Membership = Tables<'accounts_memberships'>;

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
  const adminClient = getSupabaseServerAdminClient();

  const [memberships, userResult] = await Promise.all([
    getMemberships(props.account.id),
    adminClient.auth.admin.getUserById(props.account.id),
  ]);

  if (userResult.error) {
    throw userResult.error;
  }

  const isBanned =
    'banned_until' in userResult.data.user &&
    userResult.data.user.banned_until !== 'none';

  return (
    <>
      <PageHeader
        className="border-b"
        description={
          <AppBreadcrumbs
            values={{
              [props.account.id]:
                props.account.name ?? props.account.email ?? 'Account',
            }}
          />
        }
      >
        <div className={'flex gap-x-2.5'}>
          <If condition={isBanned}>
            <AdminReactivateUserDialog userId={props.account.id}>
              <Button
                size={'sm'}
                variant={'secondary'}
                data-test={'admin-reactivate-account-button'}
              >
                <ShieldPlus className={'mr-1 h-4'} />
                Reactivate
              </Button>
            </AdminReactivateUserDialog>
          </If>

          <If condition={!isBanned}>
            <AdminBanUserDialog userId={props.account.id}>
              <Button
                size={'sm'}
                variant={'secondary'}
                data-test={'admin-ban-account-button'}
              >
                <Ban className={'text-destructive mr-1 h-3'} />
                Ban
              </Button>
            </AdminBanUserDialog>

            <AdminImpersonateUserDialog userId={props.account.id}>
              <Button
                size={'sm'}
                variant={'secondary'}
                data-test={'admin-impersonate-button'}
              >
                <VenetianMask className={'mr-1 h-4 text-blue-500'} />
                Impersonate
              </Button>
            </AdminImpersonateUserDialog>
          </If>

          <AdminDeleteUserDialog userId={props.account.id}>
            <Button
              size={'sm'}
              variant={'destructive'}
              data-test={'admin-delete-account-button'}
            >
              <BadgeX className={'mr-1 h-4'} />
              Delete
            </Button>
          </AdminDeleteUserDialog>
        </div>
      </PageHeader>

      <PageBody className={'space-y-6 py-4'}>
        <div className={'flex items-center justify-between'}>
          <div className={'flex items-center gap-x-4'}>
            <div className={'flex items-center gap-x-2.5'}>
              <ProfileAvatar
                pictureUrl={props.account.picture_url}
                displayName={props.account.name}
              />

              <span className={'text-sm font-semibold capitalize'}>
                {props.account.name}
              </span>
            </div>

            <Badge variant={'outline'}>Personal Account</Badge>

            <If condition={isBanned}>
              <Badge variant={'destructive'}>Banned</Badge>
            </If>
          </div>
        </div>

        <div className={'flex flex-col gap-y-8'}>
          <SubscriptionsTable accountId={props.account.id} />

          <div className={'divider-divider-x flex flex-col gap-y-2.5'}>
            <Heading level={6}>Teams</Heading>

            <div className={'rounded-lg border p-2'}>
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
  const members = await getMembers(props.account.slug ?? '');

  return (
    <>
      <PageHeader
        className="border-b"
        description={
          <AppBreadcrumbs
            values={{
              [props.account.id]:
                props.account.name ?? props.account.email ?? 'Account',
            }}
          />
        }
      >
        <AdminDeleteAccountDialog accountId={props.account.id}>
          <Button
            size={'sm'}
            variant={'destructive'}
            data-test={'admin-delete-account-button'}
          >
            <BadgeX className={'mr-1 h-4'} />
            Delete
          </Button>
        </AdminDeleteAccountDialog>
      </PageHeader>

      <PageBody className={'space-y-6 py-4'}>
        <div className={'flex justify-between'}>
          <div className={'flex items-center gap-x-4'}>
            <div className={'flex items-center gap-x-2.5'}>
              <ProfileAvatar
                pictureUrl={props.account.picture_url}
                displayName={props.account.name}
              />

              <span className={'text-sm font-semibold capitalize'}>
                {props.account.name}
              </span>
            </div>

            <Badge variant={'outline'}>Team Account</Badge>
          </div>
        </div>

        <div>
          <div className={'flex flex-col gap-y-8'}>
            <SubscriptionsTable accountId={props.account.id} />

            <div className={'flex flex-col gap-y-2.5'}>
              <Heading level={6}>Team Members</Heading>

              <div className={'rounded-lg border p-2'}>
                <AdminMembersTable members={members} />
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </>
  );
}

async function SubscriptionsTable(props: { accountId: string }) {
  const client = getSupabaseServerClient();

  const { data: subscription, error } = await client
    .from('subscriptions')
    .select('*, subscription_items !inner (*)')
    .eq('account_id', props.accountId)
    .maybeSingle();

  if (error) {
    return (
      <Alert variant={'destructive'}>
        <AlertTitle>There was an error loading subscription.</AlertTitle>

        <AlertDescription>
          Please check the logs for more information or try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={'flex flex-col gap-y-1'}>
      <Heading level={6}>Subscription</Heading>

      <If
        condition={subscription}
        fallback={
          <span className={'text-muted-foreground text-sm'}>
            This account does not currently have a subscription.
          </span>
        }
      >
        {(subscription) => {
          return (
            <div className={'flex flex-col space-y-4'}>
              <Table>
                <TableHeader>
                  <TableHead>Subscription ID</TableHead>

                  <TableHead>Provider</TableHead>

                  <TableHead>Customer ID</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead>Created At</TableHead>

                  <TableHead>Period Starts At</TableHead>

                  <TableHead>Ends At</TableHead>
                </TableHeader>

                <TableBody>
                  <TableRow>
                    <TableCell>
                      <span>{subscription.id}</span>
                    </TableCell>

                    <TableCell></TableCell>

                    <TableCell>
                      <span>{subscription.status}</span>
                    </TableCell>

                    <TableCell>
                      <span>{subscription.created_at}</span>
                    </TableCell>

                    <TableCell>
                      <span>{subscription.period_starts_at}</span>
                    </TableCell>

                    <TableCell>
                      <span>{subscription.period_ends_at}</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <Table>
                <TableHeader>
                  <TableHead>Product ID</TableHead>

                  <TableHead>Variant ID</TableHead>

                  <TableHead>Quantity</TableHead>

                  <TableHead>Price</TableHead>

                  <TableHead>Interval</TableHead>

                  <TableHead>Type</TableHead>
                </TableHeader>

                <TableBody>
                  {subscription.subscription_items.map((item) => {
                    return (
                      <TableRow key={item.variant_id}>
                        <TableCell>
                          <span>{item.product_id}</span>
                        </TableCell>

                        <TableCell>
                          <span>{item.variant_id}</span>
                        </TableCell>

                        <TableCell>
                          <span>{item.quantity}</span>
                        </TableCell>

                        <TableCell>
                          <span>{item.price_amount}</span>
                        </TableCell>

                        <TableCell>
                          <span>{item.interval}</span>
                        </TableCell>

                        <TableCell>
                          <span>{item.type}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          );
        }}
      </If>
    </div>
  );
}

async function getMemberships(userId: string) {
  const client = getSupabaseServerClient();

  const memberships = await client
    .from('accounts_memberships')
    .select<
      string,
      Membership & {
        account: {
          id: string;
          name: string;
        };
      }
    >('*, account: account_id !inner (id, name)')
    .eq('user_id', userId);

  if (memberships.error) {
    throw memberships.error;
  }

  return memberships.data;
}

async function getMembers(accountSlug: string) {
  const drizzleClient = await getDrizzleSupabaseClient();

  const data = await drizzleClient.runTransaction(async (tx) => {
    return await tx
      .select({
        id: accountsMemberships.id,
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
  });

  return data;
}
