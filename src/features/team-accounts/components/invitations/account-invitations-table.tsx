"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { If } from "~/components/makerkit/if";
import { ProfileAvatar } from "~/components/makerkit/profile-avatar";
import { Trans } from "~/components/makerkit/trans";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";

type Invitation = {
  id: string | number;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  account_id: string;
  invited_by: string;
};

import { RoleBadge } from "../members/role-badge";
import { DeleteInvitationDialog } from "./delete-invitation-dialog";
import { RenewInvitationDialog } from "./renew-invitation-dialog";
import { UpdateInvitationDialog } from "./update-invitation-dialog";

type AccountInvitationsTableProps = {
  invitations: Invitation[];

  permissions: {
    canUpdateInvitation: boolean;
    canRemoveInvitation: boolean;
    currentUserRoleHierarchy: number;
  };
};

export function AccountInvitationsTable({
  invitations,
  permissions,
}: AccountInvitationsTableProps) {
  const { t } = useTranslation("teams");
  const [search, setSearch] = useState("");
  const columns = useGetColumns(permissions);

  const filteredInvitations = invitations.filter((member) => {
    const searchString = search.toLowerCase();

    const email = (
      member.email.split("@")[0]?.toLowerCase() ?? ""
    ).toLowerCase();

    return (
      email.includes(searchString) ||
      member.role.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className={"flex flex-col space-y-2"}>
      <Input
        onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
        placeholder={t("searchInvitations")}
        value={search}
      />

      <DataTable
        columns={columns}
        data={filteredInvitations}
        data-cy={"invitations-table"}
      />
    </div>
  );
}

function useGetColumns(permissions: {
  canUpdateInvitation: boolean;
  canRemoveInvitation: boolean;
  currentUserRoleHierarchy: number;
}): ColumnDef<Invitation>[] {
  const { t } = useTranslation("teams");

  return useMemo(
    () => [
      {
        header: t("emailLabel"),
        size: 200,
        cell: ({ row }) => {
          const member = row.original;
          const email = member.email;

          return (
            <span
              className={"flex items-center space-x-4 text-left"}
              data-test={"invitation-email"}
            >
              <span>
                <ProfileAvatar text={email} />
              </span>

              <span>{email}</span>
            </span>
          );
        },
      },
      {
        header: t("roleLabel"),
        cell: ({ row }) => {
          const { role } = row.original;

          return <RoleBadge role={role} />;
        },
      },
      {
        header: t("invitedAtLabel"),
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        header: t("expiresAtLabel"),
        cell: ({ row }) =>
          new Date(row.original.expires_at).toLocaleDateString(),
      },
      {
        header: t("inviteStatus"),
        cell: ({ row }) => {
          const isExpired = getIsInviteExpired(row.original.expires_at);

          if (isExpired) {
            return <Badge variant={"warning"}>{t("expired")}</Badge>;
          }

          return <Badge variant={"success"}>{t("active")}</Badge>;
        },
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <ActionsDropdown
            invitation={row.original}
            permissions={permissions}
          />
        ),
      },
    ],
    [permissions, t]
  );
}

function ActionsDropdown({
  permissions,
  invitation,
}: {
  permissions: AccountInvitationsTableProps["permissions"];
  invitation: Invitation;
}) {
  const [isDeletingInvite, setIsDeletingInvite] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isRenewingInvite, setIsRenewingInvite] = useState(false);

  if (!(permissions.canUpdateInvitation || permissions.canRemoveInvitation)) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"icon"} variant={"ghost"}>
            <Ellipsis className={"h-5 w-5"} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <If condition={permissions.canUpdateInvitation}>
            <DropdownMenuItem
              data-test={"update-invitation-trigger"}
              onClick={() => setIsUpdatingRole(true)}
            >
              <Trans i18nKey={"teams:updateInvitation"} />
            </DropdownMenuItem>

            <If condition={getIsInviteExpired(invitation.expires_at)}>
              <DropdownMenuItem
                data-test={"renew-invitation-trigger"}
                onClick={() => setIsRenewingInvite(true)}
              >
                <Trans i18nKey={"teams:renewInvitation"} />
              </DropdownMenuItem>
            </If>
          </If>

          <If condition={permissions.canRemoveInvitation}>
            <DropdownMenuItem
              data-test={"remove-invitation-trigger"}
              onClick={() => setIsDeletingInvite(true)}
            >
              <Trans i18nKey={"teams:removeInvitation"} />
            </DropdownMenuItem>
          </If>
        </DropdownMenuContent>
      </DropdownMenu>

      <If condition={isDeletingInvite}>
        <DeleteInvitationDialog
          invitationId={Number(invitation.id)}
          isOpen
          setIsOpen={setIsDeletingInvite}
        />
      </If>

      <If condition={isUpdatingRole}>
        <UpdateInvitationDialog
          invitationId={Number(invitation.id)}
          isOpen
          setIsOpen={setIsUpdatingRole}
          userRole={invitation.role}
          userRoleHierarchy={permissions.currentUserRoleHierarchy}
        />
      </If>

      <If condition={isRenewingInvite}>
        <RenewInvitationDialog
          email={invitation.email}
          invitationId={Number(invitation.id)}
          isOpen
          setIsOpen={setIsRenewingInvite}
        />
      </If>
    </>
  );
}

function getIsInviteExpired(isoExpiresAt: string) {
  const currentIsoTime = new Date().toISOString();

  const isoExpiresAtDate = new Date(isoExpiresAt);
  const currentIsoTimeDate = new Date(currentIsoTime);

  return isoExpiresAtDate < currentIsoTimeDate;
}
