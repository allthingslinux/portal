"use client";

import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { If } from "~/components/portal/if";
import { OauthProviderLogoImage } from "~/components/portal/oauth-provider-logo-image";
import { Spinner } from "~/components/portal/spinner";
import { Trans } from "~/components/portal/trans";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { Separator } from "~/components/ui/separator";
import { toast } from "~/components/ui/sonner";
import {
  type UserAccount,
  useLinkAccount,
  useSession,
  useUnlinkAccount,
  useUserAccounts,
} from "~/core/auth/better-auth/hooks";
import type { Provider } from "~/core/auth/better-auth/types";

import { UpdateEmailForm } from "../email/update-email-form";
import { UpdatePasswordForm } from "../password/update-password-form";

type LinkAccountsListProps = {
  providers: Provider[];
  showPasswordOption?: boolean;
  showEmailOption?: boolean;
  enabled?: boolean;
  redirectTo?: string;
};

export function LinkAccountsList(props: LinkAccountsListProps) {
  const unlinkMutation = useUnlinkAccount();
  const linkMutation = useLinkAccount();
  const pathname = usePathname();

  const { data: accountsData, isLoading: isLoadingIdentities } =
    useUserAccounts();

  const accounts = accountsData?.accounts || [];
  const hasMultipleIdentities = accountsData?.hasMultipleAccounts;
  const isProviderConnected =
    accountsData?.isProviderConnected || (() => false);

  // Get user email from session
  const { data: user } = useSession();
  const userEmail = user?.email || "";

  // If enabled, display available providers
  const availableProviders = props.enabled
    ? props.providers.filter((provider) => !isProviderConnected(provider))
    : [];
  const amr =
    user && Array.isArray((user as Record<string, unknown>).amr)
      ? ((user as Record<string, unknown>).amr as Array<{ method: string }>)
      : [];

  const isConnectedWithPassword = amr.some(
    (item: { method: string }) => item.method === "password"
  );

  // Show all connected accounts, even if their provider isn't in the allowed providers list
  const connectedIdentities = accounts;

  const emailAccount = accounts.find((acc) => acc.provider === "email");
  const canLinkEmailAccount = !emailAccount && props.showEmailOption;

  const canLinkPassword =
    emailAccount && props.showPasswordOption && !isConnectedWithPassword;

  const shouldDisplayAvailableAccountsSection =
    canLinkEmailAccount || canLinkPassword || availableProviders.length;

  /**
   * @name handleUnlinkAccount
   * @param account
   */
  const handleUnlinkAccount = (account: UserAccount) => {
    const promise = unlinkMutation.mutateAsync({ accountId: account.id });

    toast.promise(promise, {
      loading: <Trans i18nKey={"account:unlinkingAccount"} />,
      success: <Trans i18nKey={"account:accountUnlinked"} />,
      error: <Trans i18nKey={"account:unlinkAccountError"} />,
    });
  };

  /**
   * @name handleLinkAccount
   * @param provider
   */
  const handleLinkAccount = (provider: Provider) => {
    const promise = linkMutation.mutateAsync(provider);

    toast.promise(promise, {
      loading: <Trans i18nKey={"account:linkingAccount"} />,
      success: <Trans i18nKey={"account:accountLinked"} />,
      error: <Trans i18nKey={"account:linkAccountError"} />,
    });
  };

  if (isLoadingIdentities) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <If condition={connectedIdentities.length > 0}>
        <div className="space-y-2.5">
          <div>
            <h3 className="font-medium text-foreground text-sm">
              <Trans i18nKey={"account:linkedMethods"} />
            </h3>

            <p className="text-muted-foreground text-xs">
              <Trans i18nKey={"account:alreadyLinkedMethodsDescription"} />
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            {connectedIdentities.map((account) => (
              <Item key={account.id} variant="muted">
                <ItemMedia>
                  <div className="flex h-5 w-5 items-center justify-center text-muted-foreground">
                    <OauthProviderLogoImage providerId={account.provider} />
                  </div>
                </ItemMedia>

                <ItemContent>
                  <ItemHeader>
                    <div className="flex flex-col">
                      <ItemTitle className="font-medium text-sm capitalize">
                        <span>{account.provider}</span>
                      </ItemTitle>

                      <If condition={userEmail && account.provider === "email"}>
                        <ItemDescription>{userEmail}</ItemDescription>
                      </If>
                    </div>
                  </ItemHeader>
                </ItemContent>

                <ItemActions>
                  <If condition={hasMultipleIdentities}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          disabled={unlinkMutation.isPending}
                          size="sm"
                          variant="outline"
                        >
                          <If condition={unlinkMutation.isPending}>
                            <Spinner className="mr-2 h-3 w-3" />
                          </If>
                          <Trans i18nKey={"account:unlinkAccount"} />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            <Trans i18nKey={"account:confirmUnlinkAccount"} />
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            <Trans
                              i18nKey={"account:unlinkAccountConfirmation"}
                              values={{ provider: account.provider }}
                            />
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            <Trans i18nKey={"common:cancel"} />
                          </AlertDialogCancel>

                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleUnlinkAccount(account)}
                          >
                            <Trans i18nKey={"account:unlinkAccount"} />
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </If>
                </ItemActions>
              </Item>
            ))}
          </div>
        </div>
      </If>

      <If
        condition={shouldDisplayAvailableAccountsSection}
        fallback={<NoAccountsAvailable />}
      >
        <Separator />

        <div className="space-y-2.5">
          <div>
            <h3 className="font-medium text-foreground text-sm">
              <Trans i18nKey={"account:availableMethods"} />
            </h3>

            <p className="text-muted-foreground text-xs">
              <Trans i18nKey={"account:availableMethodsDescription"} />
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <If condition={canLinkEmailAccount}>
              <UpdateEmailDialog redirectTo={pathname} />
            </If>

            <If condition={canLinkPassword}>
              <UpdatePasswordDialog
                redirectTo={props.redirectTo || "/home"}
                userEmail={userEmail}
              />
            </If>

            {availableProviders.map((provider) => (
              <Item
                className="hover:bg-muted/50"
                key={provider}
                onClick={() => handleLinkAccount(provider)}
                role="button"
                variant="outline"
              >
                <ItemMedia>
                  <OauthProviderLogoImage providerId={provider} />
                </ItemMedia>

                <ItemContent>
                  <ItemTitle className="capitalize">{provider}</ItemTitle>

                  <ItemDescription>
                    <Trans
                      i18nKey={"account:linkAccountDescription"}
                      values={{ provider }}
                    />
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </div>
        </div>
      </If>
    </div>
  );
}

function NoAccountsAvailable() {
  return (
    <div>
      <span className="text-muted-foreground text-xs">
        <Trans i18nKey={"account:noAccountsAvailable"} />
      </span>
    </div>
  );
}

function UpdateEmailDialog(props: { redirectTo: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Item className="hover:bg-muted/50" role="button" variant="outline">
          <ItemMedia>
            <div className="flex h-5 w-5 items-center justify-center text-muted-foreground">
              <OauthProviderLogoImage providerId={"email"} />
            </div>
          </ItemMedia>

          <ItemContent>
            <ItemHeader>
              <div className="flex flex-col">
                <ItemTitle className="font-medium text-sm">
                  <Trans i18nKey={"account:setEmailAddress"} />
                </ItemTitle>

                <ItemDescription>
                  <Trans i18nKey={"account:setEmailDescription"} />
                </ItemDescription>
              </div>
            </ItemHeader>
          </ItemContent>
        </Item>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={"account:setEmailAddress"} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={"account:setEmailDescription"} />
          </DialogDescription>
        </DialogHeader>

        <Suspense
          fallback={
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <UpdateEmailForm
            callbackPath={props.redirectTo}
            onSuccess={() => {
              setOpen(false);
            }}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

function UpdatePasswordDialog(props: {
  redirectTo: string;
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Item className="hover:bg-muted/50" role="button" variant="outline">
          <ItemMedia>
            <div className="flex h-5 w-5 items-center justify-center text-muted-foreground">
              <OauthProviderLogoImage providerId={"password"} />
            </div>
          </ItemMedia>

          <ItemContent>
            <ItemHeader>
              <div className="flex flex-col">
                <ItemTitle className="font-medium text-sm">
                  <Trans i18nKey={"account:linkEmailPassword"} />
                </ItemTitle>

                <ItemDescription>
                  <Trans i18nKey={"account:updatePasswordDescription"} />
                </ItemDescription>
              </div>
            </ItemHeader>
          </ItemContent>
        </Item>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={"account:linkEmailPassword"} />
          </DialogTitle>
        </DialogHeader>

        <Suspense
          fallback={
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <UpdatePasswordForm
            callbackPath={props.redirectTo}
            email={props.userEmail}
            onSuccess={() => {
              setOpen(false);
            }}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
