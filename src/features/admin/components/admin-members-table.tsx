"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "~/components/makerkit/data-table";
import { ProfileAvatar } from "~/components/makerkit/profile-avatar";

type AdminMember = {
  id: string;
  user_id: string;
  account_id: string;
  role: string;
  name: string;
  email: string;
  picture_url: string;
  created_at: string | null;
  updated_at: string | null;
};

export function AdminMembersTable(props: { members: AdminMember[] }) {
  return <DataTable columns={getColumns()} data={props.members} />;
}

function getColumns(): ColumnDef<AdminMember>[] {
  return [
    {
      header: "User ID",
      accessorKey: "user_id",
    },
    {
      header: "Name",
      cell: ({ row }) => {
        const name = row.original.name ?? row.original.email;

        return (
          <div className={"flex items-center space-x-2"}>
            <div>
              <ProfileAvatar
                displayName={name}
                pictureUrl={row.original.picture_url}
              />
            </div>

            <Link
              className={"hover:underline"}
              href={`/admin/accounts/${row.original.id}`}
            >
              <span>{name}</span>
            </Link>
          </div>
        );
      },
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Role",
      cell: ({ row }) => row.original.role,
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
