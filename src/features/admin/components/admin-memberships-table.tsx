"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "~/components/portal/data-table";

type Membership = {
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

export function AdminMembershipsTable(props: { memberships: Membership[] }) {
  return <DataTable columns={getColumns()} data={props.memberships} />;
}

function getColumns(): ColumnDef<Membership>[] {
  return [
    {
      header: "User ID",
      accessorKey: "user_id",
    },
    {
      header: "Team",
      cell: ({ row }) => (
        <Link
          className={"hover:underline"}
          href={`/admin/accounts/${row.original.account_id}`}
        >
          {row.original.account.name}
        </Link>
      ),
    },
    {
      header: "Role",
      accessorKey: "account_role",
    },
    {
      header: "Created At",
      accessorKey: "created_at",
    },
    {
      header: "Updated At",
      accessorKey: "updated_at",
    },
  ];
}
