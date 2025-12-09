import { eq } from "drizzle-orm";
import { cache } from "react";
import { getDrizzleSupabaseAdminClient } from "~/core/database/supabase/clients/drizzle-client";
import type { Tables } from "~/core/database/supabase/database.types";
import {
  accounts,
  accountsMemberships,
} from "~/core/database/supabase/drizzle/schema";
import { AdminAccountPage } from "~/features/admin/components/admin-account-page";
import { AdminGuard } from "~/features/admin/components/admin-guard";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

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
    ...account,
    memberships,
  } as unknown as Tables<"accounts"> & {
    memberships: Tables<"accounts_memberships">[];
  };
}
