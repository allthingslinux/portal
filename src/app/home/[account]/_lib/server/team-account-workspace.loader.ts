import "server-only";

import { redirect } from "next/navigation";
import pathsConfig from "~/config/paths.config";
import { createTeamAccountsApi } from "~/features/team-accounts/server/api";
import { requireUserInServerComponent } from "~/shared/lib/server/require-user-in-server-component";
import { createWorkspaceLoader } from "~/shared/next/loaders/create-workspace-loader";

export type TeamAccountWorkspace = Awaited<
  ReturnType<typeof loadTeamWorkspace>
>;

/**
 * Load the account workspace data.
 * We place this function into a separate file so it can be reused in multiple places across the server components.
 *
 * This function is used in the layout component for the account workspace.
 * It is cached so that the data is only fetched once per request.
 *
 * @param accountSlug
 */
export const loadTeamWorkspace = createWorkspaceLoader(
  async (accountSlug: string) => {
    const api = createTeamAccountsApi();

    const user = await requireUserInServerComponent();

    const workspaceResult = await api.getAccountWorkspace(accountSlug, user.id);

    if (!workspaceResult.workspace?.account) {
      return redirect(pathsConfig.app.home);
    }

    const account = {
      ...workspaceResult.workspace.account,
      slug: workspaceResult.workspace.account.slug ?? "",
      pictureUrl: workspaceResult.workspace.account.pictureUrl ?? "",
    };

    const accounts = workspaceResult.workspace.accounts.map((acc) => ({
      id: acc.id ?? "",
      name: acc.name ?? "",
      slug: acc.slug ?? "",
      role: acc.role ?? "",
      pictureUrl: acc.pictureUrl ?? "",
    }));

    return {
      account,
      accounts,
      user,
    };
  }
);
