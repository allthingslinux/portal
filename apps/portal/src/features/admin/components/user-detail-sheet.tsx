"use client";

import type { AdminUserDetailResponse } from "@portal/api/types";
import { Badge } from "@portal/ui/ui/badge";
import { Separator } from "@portal/ui/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@portal/ui/ui/sheet";
import { formatDate } from "@portal/utils/date";

import { useUser } from "@/features/admin/hooks/use-admin";
import { integrationStatusLabels } from "@/features/integrations/lib/core/constants";

interface UserDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailSheet({
  open,
  onOpenChange,
  userId,
}: UserDetailSheetProps) {
  const { data, isPending, error } = useUser(userId);

  if (!userId) {
    return null;
  }

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className="flex w-full flex-col gap-0 overflow-y-auto p-6 sm:max-w-lg"
        side="right"
      >
        <SheetHeader className="p-0 pr-12 pb-6">
          <SheetTitle>User details</SheetTitle>
          <SheetDescription>
            User profile and integration accounts (IRC, XMPP, mailcow).
          </SheetDescription>
        </SheetHeader>

        <Separator className="mb-6" />

        {isPending && (
          <div className="py-6 text-muted-foreground text-sm">
            Loading user…
          </div>
        )}

        {error && (
          <div className="py-6 text-destructive text-sm">
            Failed to load user: {error.message}
          </div>
        )}

        {data && <UserDetailContent userDetail={data} />}
      </SheetContent>
    </Sheet>
  );
}

function UserDetailContent({
  userDetail,
}: {
  userDetail: AdminUserDetailResponse;
}) {
  const { user: userRow, ircAccount, xmppAccount, mailcowAccount } = userDetail;

  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-5">
        <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Profile
        </h3>
        <dl className="space-y-4 text-sm">
          <div className="space-y-1">
            <dt className="font-medium">Email</dt>
            <dd className="text-muted-foreground">{userRow.email}</dd>
          </div>
          <div className="space-y-1">
            <dt className="font-medium">Name</dt>
            <dd className="text-muted-foreground">{userRow.name ?? "—"}</dd>
          </div>
          <div className="space-y-1">
            <dt className="font-medium">Role</dt>
            <dd>
              <Badge variant="secondary">{userRow.role ?? "user"}</Badge>
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="font-medium">Status</dt>
            <dd>
              {userRow.banned ? (
                <Badge variant="destructive">Banned</Badge>
              ) : (
                <Badge variant="secondary">Active</Badge>
              )}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="font-medium">Created</dt>
            <dd className="text-muted-foreground" suppressHydrationWarning>
              {formatDate(userRow.createdAt)}
            </dd>
          </div>
        </dl>
      </section>

      <Separator />

      <section className="space-y-5">
        <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Integrations
        </h3>
        <div className="space-y-5">
          {ircAccount ? (
            <div className="rounded-lg border p-4">
              <div className="mb-3 font-medium">IRC</div>
              <dl className="space-y-3 text-sm">
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Nick</dt>
                  <dd className="font-mono">{ircAccount.nick}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Server</dt>
                  <dd>
                    {ircAccount.server}:{ircAccount.port}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant="outline">
                      {integrationStatusLabels[
                        ircAccount.status as keyof typeof integrationStatusLabels
                      ] ?? ircAccount.status}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-muted-foreground text-sm">
              No IRC account
            </div>
          )}

          {xmppAccount ? (
            <div className="rounded-lg border p-4">
              <div className="mb-3 font-medium">XMPP</div>
              <dl className="space-y-3 text-sm">
                <div className="space-y-1">
                  <dt className="text-muted-foreground">JID</dt>
                  <dd className="font-mono">{xmppAccount.jid}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Username</dt>
                  <dd className="font-mono">{xmppAccount.username}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant="outline">
                      {integrationStatusLabels[
                        xmppAccount.status as keyof typeof integrationStatusLabels
                      ] ?? xmppAccount.status}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-muted-foreground text-sm">
              No XMPP account
            </div>
          )}

          {mailcowAccount ? (
            <div className="rounded-lg border p-4">
              <div className="mb-3 font-medium">mailcow</div>
              <dl className="space-y-3 text-sm">
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-mono">{mailcowAccount.email}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Domain</dt>
                  <dd className="font-mono">{mailcowAccount.domain}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant="outline">
                      {integrationStatusLabels[
                        mailcowAccount.status as keyof typeof integrationStatusLabels
                      ] ?? mailcowAccount.status}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-muted-foreground text-sm">
              No mailcow account
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
