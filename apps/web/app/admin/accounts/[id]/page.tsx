import { cache } from 'react';

import { eq } from 'drizzle-orm';

import { AdminAccountPage } from '@portal/admin/components/admin-account-page';
import { AdminGuard } from '@portal/admin/components/admin-guard';
import { getDrizzleSupabaseAdminClient } from '@portal/supabase/drizzle-client';
import { accounts, accountsMemberships } from '@portal/supabase/drizzle-schema';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export const generateMetadata = async (props: Params) => {
  const params = await props.params;
  const account = await loadAccount(params.id);

  return {
    title: `Admin | ${account.name}`,
  };
};

async function AccountPage(props: Params) {
  const params = await props.params;
  const account = await loadAccount(params.id);

  return <AdminAccountPage account={account} />;
}

export default AdminGuard(AccountPage);

const loadAccount = cache(accountLoader);

async function accountLoader(id: string) {
  const adminClient = getDrizzleSupabaseAdminClient();

  const result = await adminClient
    .select({
      id: accounts.id,
      name: accounts.name,
      slug: accounts.slug,
      email: accounts.email,
      pictureUrl: accounts.pictureUrl,
      isPersonalAccount: accounts.isPersonalAccount,
      primaryOwnerUserId: accounts.primaryOwnerUserId,
      customerId: accounts.customerId,
      createdAt: accounts.createdAt,
      updatedAt: accounts.updatedAt,
      memberships: {
        id: accountsMemberships.id,
        userId: accountsMemberships.userId,
        accountId: accountsMemberships.accountId,
        accountRole: accountsMemberships.accountRole,
        createdAt: accountsMemberships.createdAt,
        updatedAt: accountsMemberships.updatedAt,
      },
    })
    .from(accounts)
    .leftJoin(
      accountsMemberships,
      eq(accounts.id, accountsMemberships.accountId),
    )
    .where(eq(accounts.id, id));

  if (result.length === 0) {
    throw new Error('Account not found');
  }

  // Transform the result to match the expected structure
  const account = result[0];
  const memberships = result.map((r) => r.memberships).filter(Boolean);

  return {
    ...account,
    memberships,
  };
}
