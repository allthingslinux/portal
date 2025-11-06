'use client';

import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';

import { Tables } from '~/core/database/supabase/database.types';
import { DataTable } from '~/components/makerkit/data-table';

type Membership = Tables<'accounts_memberships'> & {
  account: {
    id: string;
    name: string;
  };
};

export function AdminMembershipsTable(props: { memberships: Membership[] }) {
  return <DataTable data={props.memberships} columns={getColumns()} />;
}

function getColumns(): ColumnDef<Membership>[] {
  return [
    {
      header: 'User ID',
      accessorKey: 'user_id',
    },
    {
      header: 'Team',
      cell: ({ row }) => {
        return (
          <Link
            className={'hover:underline'}
            href={`/admin/accounts/${row.original.account_id}`}
          >
            {row.original.account.name}
          </Link>
        );
      },
    },
    {
      header: 'Role',
      accessorKey: 'account_role',
    },
    {
      header: 'Created At',
      accessorKey: 'created_at',
    },
    {
      header: 'Updated At',
      accessorKey: 'updated_at',
    },
  ];
}
