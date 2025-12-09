"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "~/components/makerkit/data-table";
import type { Tables } from "~/core/database/supabase/database.types";

type Membership = Tables<"accounts_memberships"> & {
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
