import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { cache } from "react";
import { AdminAccountPage } from "~/components/features/admin-account-page";
import { AdminGuard } from "~/components/features/admin-guard";
import { db } from "~/lib/database/client";
import { accounts, accountsMemberships } from "~/lib/database/schema";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export const generateMetadata = async (props: Params): Promise<Metadata> => {
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

type AccountRow = typeof accounts.$inferSelect;
type MembershipRow = typeof accountsMemberships.$inferSelect;

type AdminAccount = AccountRow & { memberships: MembershipRow[] };

async function accountLoader(id: string): Promise<AdminAccount> {
  const adminClient = db;

  // Get the account
  const accountResult = await adminClient
    .select()
    .from(accounts)
    .where(eq(accounts.id, id))
    .limit(1);

  if (accountResult.length === 0) {
    throw new Error("Account not found");
  }

  const account = accountResult[0];

  // Get memberships
  const memberships = await adminClient
    .select()
    .from(accountsMemberships)
    .where(eq(accountsMemberships.accountId, id));

  return {
    id: account.id,
    name: account.name,
    email: account.email ?? null,
    updatedAt: account.updatedAt,
    createdAt: account.createdAt,
    pictureUrl: account.pictureUrl,
    publicData: account.publicData,
    primaryOwnerUserId: account.primaryOwnerUserId,
    memberships,
  };
}
