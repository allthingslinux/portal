import { createAccountsApi } from "~/features/accounts/server/api";
import { requireUserInServerComponent } from "~/shared/lib/server/require-user-in-server-component";
import { createWorkspaceLoader } from "~/shared/next/loaders/create-workspace-loader";

const shouldLoadAccounts = false; // Team accounts disabled

type AccountItem = { label: string; value: string; image: string | null };
type WorkspaceRecord = {
  id: string | null;
  name: string | null;
  pictureUrl: string | null;
};

export type UserWorkspace = Awaited<ReturnType<typeof loadUserWorkspace>>;

/**
 * @name loadUserWorkspace
 * @description
 * Load the user workspace data. It's a cached per-request function that fetches the user workspace data.
 * It can be used across the server components to load the user workspace data.
 */
export const loadUserWorkspace = createWorkspaceLoader(async () => {
  const api = createAccountsApi();

  const workspacePromise =
    api.getAccountWorkspace() as Promise<WorkspaceRecord>;

  const user = await requireUserInServerComponent();

  const accountsPromise = shouldLoadAccounts
    ? () => api.loadUserAccounts(user.id)
    : () => Promise.resolve([] as AccountItem[]);

  const [accounts, workspace] = await Promise.all([
    accountsPromise(),
    workspacePromise,
  ]);

  const mappedWorkspace = workspace
    ? {
        id: workspace.id ?? null,
        name: workspace.name ?? null,
        picture_url: workspace.pictureUrl ?? null,
      }
    : { id: null, name: null, picture_url: null };

  return {
    accounts,
    workspace: mappedWorkspace,
    user,
  };
});
