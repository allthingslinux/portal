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

    const [workspace, user] = await Promise.all([
      api.getAccountWorkspace(accountSlug),
      requireUserInServerComponent(),
    ]);

    // we cannot find any record for the selected account
    // so we redirect the user to the home page
    if (!workspace.data?.account) {
      return redirect(pathsConfig.app.home);
    }

    const account = {
      ...workspace.data.account,
      slug: workspace.data.account.slug ?? "",
      picture_url: workspace.data.account.picture_url ?? "",
    };

    const accounts = workspace.data.accounts.map((acc) => ({
      id: acc.id ?? "",
      name: acc.name ?? "",
      slug: acc.slug ?? "",
      role: acc.role ?? "",
      picture_url: acc.pictureUrl ?? "",
    }));

    return {
      account,
      accounts,
      user,
    };
  }
);
