import featureFlagsConfig from "~/config/feature-flags.config";
import { createAccountsApi } from "~/features/accounts/server/api";
import { requireUserInServerComponent } from "~/shared/lib/server/require-user-in-server-component";
import { createWorkspaceLoader } from "~/shared/next/loaders/create-workspace-loader";

const shouldLoadAccounts = featureFlagsConfig.enableTeamAccounts;

type AccountItem = { label: string; value: string; image: string | null };

export type UserWorkspace = Awaited<ReturnType<typeof loadUserWorkspace>>;

/**
 * @name loadUserWorkspace
 * @description
 * Load the user workspace data. It's a cached per-request function that fetches the user workspace data.
 * It can be used across the server components to load the user workspace data.
 */
export const loadUserWorkspace = createWorkspaceLoader(async () => {
  const api = createAccountsApi();

  const accountsPromise = shouldLoadAccounts
    ? () => api.loadUserAccounts()
    : () => Promise.resolve([] as AccountItem[]);

  const workspacePromise = api.getAccountWorkspace();

  const [accounts, workspace, user] = await Promise.all([
    accountsPromise(),
    workspacePromise,
    requireUserInServerComponent(),
  ]);

  return {
    accounts,
    workspace,
    user,
  };
});
