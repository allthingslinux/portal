import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { loadAdminDashboard } from "../lib/server/loaders/admin-dashboard.loader";

export async function AdminDashboard() {
  const data = await loadAdminDashboard();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>

          <CardDescription>
            The number of personal accounts that have been created.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className={"flex justify-between"}>
            <Figure>{data.personalAccountsCount}</Figure>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Accounts</CardTitle>

          <CardDescription>
            The number of team accounts that have been created.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className={"flex justify-between"}>
            <Figure>{data.teamAccountsCount}</Figure>
          </div>
        </CardContent>
      </Card>

      <div>
        <p className={"w-max text-muted-foreground text-xs"}>
          The above data is estimated and may not be 100% accurate.
        </p>
      </div>
    </div>
  );
}

function Figure(props: React.PropsWithChildren) {
  return <div className={"font-bold text-3xl"}>{props.children}</div>;
}
