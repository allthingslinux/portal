'use client';

import { useMemo, useState } from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Database } from '@portal/supabase/database';
import { Badge } from '@portal/ui/badge';
import { Button } from '@portal/ui/button';
import { DataTable } from '@portal/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@portal/ui/dropdown-menu';
import { If } from '@portal/ui/if';
import { Input } from '@portal/ui/input';
import { ProfileAvatar } from '@portal/ui/profile-avatar';
import { Trans } from '@portal/ui/trans';

import { RemoveMemberDialog } from './remove-member-dialog';
import { RoleBadge } from './role-badge';
import { TransferOwnershipDialog } from './transfer-ownership-dialog';
import { UpdateMemberRoleDialog } from './update-member-role-dialog';

type Members =
  Database['public']['Functions']['get_account_members']['Returns'];

interface Permissions {
  canUpdateRole: (roleHierarchy: number) => boolean;
  canRemoveFromAccount: (roleHierarchy: number) => boolean;
  canTransferOwnership: boolean;
}

type AccountMembersTableProps = {
  members: Members;
  currentUserId: string;
  currentAccountId: string;
  userRoleHierarchy: number;
  isPrimaryOwner: boolean;
  canManageRoles: boolean;
};

export function AccountMembersTable({
  members,
  currentUserId,
  currentAccountId,
  isPrimaryOwner,
  userRoleHierarchy,
  canManageRoles,
}: AccountMembersTableProps) {
  const [search, setSearch] = useState('');
  const { t } = useTranslation('teams');

  const permissions = {
    canUpdateRole: (targetRole: number) => {
      return (
        isPrimaryOwner || (canManageRoles && userRoleHierarchy < targetRole)
      );
    },
    canRemoveFromAccount: (targetRole: number) => {
      return (
        isPrimaryOwner || (canManageRoles && userRoleHierarchy < targetRole)
      );
    },
    canTransferOwnership: isPrimaryOwner,
  };

  const columns = useGetColumns(permissions, {
    currentUserId,
    currentAccountId,
    currentRoleHierarchy: userRoleHierarchy,
  });

  const filteredMembers = members
    .filter((member) => {
      const searchString = search.toLowerCase();

      const displayName = (
        member.name ??
        member.email.split('@')[0] ??
        ''
      ).toLowerCase();

      return (
        displayName.includes(searchString) ||
        member.role.toLowerCase().includes(searchString)
      );
    })
    .sort((prev, next) => {
      if (prev.primary_owner_user_id === prev.user_id) {
        return 0;
      }

      if (prev.role_hierarchy_level < next.role_hierarchy_level) {
        return -1;
      }

      return 1;
    });

  return (
    <div className={'flex flex-col space-y-2'}>
      <Input
        value={search}
        onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
        placeholder={t(`searchMembersPlaceholder`)}
      />

      <DataTable columns={columns} data={filteredMembers} />
    </div>
  );
}

function useGetColumns(
  permissions: Permissions,
  params: {
    currentUserId: string;
    currentAccountId: string;
    currentRoleHierarchy: number;
  },
): ColumnDef<Members[0]>[] {
  const { t } = useTranslation('teams');

  return useMemo(
    () => [
      {
        header: t('memberName'),
        size: 200,
        cell: ({ row }) => {
          const member = row.original;
          const displayName = member.name ?? member.email.split('@')[0];
          const isSelf = member.user_id === params.currentUserId;

          return (
            <span className={'flex items-center space-x-4 text-left'}>
              <span>
                <ProfileAvatar
                  displayName={displayName}
                  pictureUrl={member.picture_url}
                />
              </span>

              <span>{displayName}</span>

              <If condition={isSelf}>
                <Badge variant={'outline'}>{t('youLabel')}</Badge>
              </If>
            </span>
          );
        },
      },
      {
        header: t('emailLabel'),
        accessorKey: 'email',
        cell: ({ row }) => {
          return row.original.email ?? '-';
        },
      },
      {
        header: t('roleLabel'),
        cell: ({ row }) => {
          const { role, primary_owner_user_id, user_id } = row.original;
          const isPrimaryOwner = primary_owner_user_id === user_id;

          return (
            <span className={'flex items-center space-x-1'}>
              <RoleBadge role={role} />

              <If condition={isPrimaryOwner}>
                <span
                  className={
                    'rounded-md bg-yellow-400 px-2.5 py-1 text-xs font-medium dark:text-black'
                  }
                >
                  {t('primaryOwnerLabel')}
                </span>
              </If>
            </span>
          );
        },
      },
      {
        header: t('joinedAtLabel'),
        cell: ({ row }) => {
          return new Date(row.original.created_at).toLocaleDateString();
        },
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => (
          <ActionsDropdown
            permissions={permissions}
            member={row.original}
            currentUserId={params.currentUserId}
            currentTeamAccountId={params.currentAccountId}
            currentRoleHierarchy={params.currentRoleHierarchy}
          />
        ),
      },
    ],
    [t, params, permissions],
  );
}

function ActionsDropdown({
  permissions,
  member,
  currentUserId,
  currentTeamAccountId,
  currentRoleHierarchy,
}: {
  permissions: Permissions;
  member: Members[0];
  currentUserId: string;
  currentTeamAccountId: string;
  currentRoleHierarchy: number;
}) {
  const isCurrentUser = member.user_id === currentUserId;
  const isPrimaryOwner = member.primary_owner_user_id === member.user_id;

  if (isCurrentUser || isPrimaryOwner) {
    return null;
  }

  const memberRoleHierarchy = member.role_hierarchy_level;
  const canUpdateRole = permissions.canUpdateRole(memberRoleHierarchy);

  const canRemoveFromAccount =
    permissions.canRemoveFromAccount(memberRoleHierarchy);

  // if has no permission to update role, transfer ownership or remove from account
  // do not render the dropdown menu
  if (
    !canUpdateRole &&
    !permissions.canTransferOwnership &&
    !canRemoveFromAccount
  ) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'ghost'} size={'icon'}>
            <Ellipsis className={'h-5 w-5'} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <If condition={canUpdateRole}>
            <UpdateMemberRoleDialog
              userId={member.user_id}
              userRole={member.role}
              teamAccountId={currentTeamAccountId}
              userRoleHierarchy={currentRoleHierarchy}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trans i18nKey={'teams:updateRole'} />
              </DropdownMenuItem>
            </UpdateMemberRoleDialog>
          </If>

          <If condition={permissions.canTransferOwnership}>
            <TransferOwnershipDialog
              targetDisplayName={member.name ?? member.email}
              accountId={member.account_id}
              userId={member.user_id}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trans i18nKey={'teams:transferOwnership'} />
              </DropdownMenuItem>
            </TransferOwnershipDialog>
          </If>

          <If condition={canRemoveFromAccount}>
            <RemoveMemberDialog
              teamAccountId={currentTeamAccountId}
              userId={member.user_id}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Trans i18nKey={'teams:removeMember'} />
              </DropdownMenuItem>
            </RemoveMemberDialog>
          </If>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
