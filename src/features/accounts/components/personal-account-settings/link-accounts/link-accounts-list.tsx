"use client";

import type { Provider, UserIdentity } from "@supabase/supabase-js";

import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { If } from "~/components/makerkit/if";
import { OauthProviderLogoImage } from "~/components/makerkit/oauth-provider-logo-image";
import { Spinner } from "~/components/makerkit/spinner";
import { Trans } from "~/components/makerkit/trans";
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
import { useSession } from "~/core/auth/better-auth/hooks";
import { useLinkIdentityWithProvider } from "~/core/database/supabase/hooks/use-link-identity-with-provider";
import { useUnlinkUserIdentity } from "~/core/database/supabase/hooks/use-unlink-user-identity";
import { useUserIdentities } from "~/core/database/supabase/hooks/use-user-identities";

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
  const unlinkMutation = useUnlinkUserIdentity();
  const linkMutation = useLinkIdentityWithProvider();
  const pathname = usePathname();

  const {
    identities,
    hasMultipleIdentities,
    isProviderConnected,
    isLoading: isLoadingIdentities,
  } = useUserIdentities();

  // Get user email from email identity
  const emailIdentity = identities.find(
    (identity) => identity.provider === "email"
  );

  const userEmail = (emailIdentity?.identity_data?.email as string) || "";

  // If enabled, display available providers
  const availableProviders = props.enabled
    ? props.providers.filter((provider) => !isProviderConnected(provider))
    : [];

  const { data: user } = useSession();
  const amr = user ? user.amr : [];

  const isConnectedWithPassword = amr.some(
    (item: { method: string }) => item.method === "password"
  );

  // Show all connected identities, even if their provider isn't in the allowed providers list
  const connectedIdentities = identities;

  const canLinkEmailAccount = !emailIdentity && props.showEmailOption;

  const canLinkPassword =
    emailIdentity && props.showPasswordOption && !isConnectedWithPassword;

  const shouldDisplayAvailableAccountsSection =
    canLinkEmailAccount || canLinkPassword || availableProviders.length;

  /**
   * @name handleUnlinkAccount
   * @param identity
   */
  const handleUnlinkAccount = (identity: UserIdentity) => {
    const promise = unlinkMutation.mutateAsync(identity);

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
            {connectedIdentities.map((identity) => (
              <Item key={identity.id} variant="muted">
                <ItemMedia>
                  <div className="flex h-5 w-5 items-center justify-center text-muted-foreground">
                    <OauthProviderLogoImage providerId={identity.provider} />
                  </div>
                </ItemMedia>

                <ItemContent>
                  <ItemHeader>
                    <div className="flex flex-col">
                      <ItemTitle className="font-medium text-sm capitalize">
                        <span>{identity.provider}</span>
                      </ItemTitle>

                      <If condition={identity.identity_data?.email}>
                        <ItemDescription>
                          {identity.identity_data?.email as string}
                        </ItemDescription>
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
                              values={{ provider: identity.provider }}
                            />
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            <Trans i18nKey={"common:cancel"} />
                          </AlertDialogCancel>

                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleUnlinkAccount(identity)}
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
