'use client';

import { Suspense, useState } from 'react';

import { usePathname } from 'next/navigation';

import type { Provider, UserIdentity } from '@supabase/supabase-js';

import { useLinkIdentityWithProvider } from '~/core/database/supabase/hooks/use-link-identity-with-provider';
import { useUnlinkUserIdentity } from '~/core/database/supabase/hooks/use-unlink-user-identity';
import { useUser } from '~/core/database/supabase/hooks/use-user';
import { useUserIdentities } from '~/core/database/supabase/hooks/use-user-identities';
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
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { If } from '~/components/makerkit/if';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '~/components/ui/item';
import { OauthProviderLogoImage } from '~/components/makerkit/oauth-provider-logo-image';
import { Separator } from '~/components/ui/separator';
import { toast } from '~/components/ui/sonner';
import { Spinner } from '~/components/makerkit/spinner';
import { Trans } from '~/components/makerkit/trans';

import { UpdateEmailForm } from '../email/update-email-form';
import { UpdatePasswordForm } from '../password/update-password-form';

interface LinkAccountsListProps {
  providers: Provider[];
  showPasswordOption?: boolean;
  showEmailOption?: boolean;
  enabled?: boolean;
  redirectTo?: string;
}

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
    (identity) => identity.provider === 'email',
  );

  const userEmail = (emailIdentity?.identity_data?.email as string) || '';

  // If enabled, display available providers
  const availableProviders = props.enabled
    ? props.providers.filter((provider) => !isProviderConnected(provider))
    : [];

  const user = useUser();
  const amr = user.data ? user.data.amr : [];

  const isConnectedWithPassword = amr.some(
    (item: { method: string }) => item.method === 'password',
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
      loading: <Trans i18nKey={'account:unlinkingAccount'} />,
      success: <Trans i18nKey={'account:accountUnlinked'} />,
      error: <Trans i18nKey={'account:unlinkAccountError'} />,
    });
  };

  /**
   * @name handleLinkAccount
   * @param provider
   */
  const handleLinkAccount = (provider: Provider) => {
    const promise = linkMutation.mutateAsync(provider);

    toast.promise(promise, {
      loading: <Trans i18nKey={'account:linkingAccount'} />,
      success: <Trans i18nKey={'account:accountLinked'} />,
      error: <Trans i18nKey={'account:linkAccountError'} />,
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
            <h3 className="text-foreground text-sm font-medium">
              <Trans i18nKey={'account:linkedMethods'} />
            </h3>

            <p className="text-muted-foreground text-xs">
              <Trans i18nKey={'account:alreadyLinkedMethodsDescription'} />
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            {connectedIdentities.map((identity) => (
              <Item key={identity.id} variant="muted">
                <ItemMedia>
                  <div className="text-muted-foreground flex h-5 w-5 items-center justify-center">
                    <OauthProviderLogoImage providerId={identity.provider} />
                  </div>
                </ItemMedia>

                <ItemContent>
                  <ItemHeader>
                    <div className="flex flex-col">
                      <ItemTitle className="text-sm font-medium capitalize">
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
                          variant="outline"
                          size="sm"
                          disabled={unlinkMutation.isPending}
                        >
                          <If condition={unlinkMutation.isPending}>
                            <Spinner className="mr-2 h-3 w-3" />
                          </If>
                          <Trans i18nKey={'account:unlinkAccount'} />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            <Trans i18nKey={'account:confirmUnlinkAccount'} />
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            <Trans
                              i18nKey={'account:unlinkAccountConfirmation'}
                              values={{ provider: identity.provider }}
                            />
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            <Trans i18nKey={'common:cancel'} />
                          </AlertDialogCancel>

                          <AlertDialogAction
                            onClick={() => handleUnlinkAccount(identity)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            <Trans i18nKey={'account:unlinkAccount'} />
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
            <h3 className="text-foreground text-sm font-medium">
              <Trans i18nKey={'account:availableMethods'} />
            </h3>

            <p className="text-muted-foreground text-xs">
              <Trans i18nKey={'account:availableMethodsDescription'} />
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <If condition={canLinkEmailAccount}>
              <UpdateEmailDialog redirectTo={pathname} />
            </If>

            <If condition={canLinkPassword}>
              <UpdatePasswordDialog
                userEmail={userEmail}
                redirectTo={props.redirectTo || '/home'}
              />
            </If>

            {availableProviders.map((provider) => (
              <Item
                key={provider}
                variant="outline"
                onClick={() => handleLinkAccount(provider)}
                role="button"
                className="hover:bg-muted/50"
              >
                <ItemMedia>
                  <OauthProviderLogoImage providerId={provider} />
                </ItemMedia>

                <ItemContent>
                  <ItemTitle className="capitalize">{provider}</ItemTitle>

                  <ItemDescription>
                    <Trans
                      i18nKey={'account:linkAccountDescription'}
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
        <Trans i18nKey={'account:noAccountsAvailable'} />
      </span>
    </div>
  );
}

function UpdateEmailDialog(props: { redirectTo: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Item variant="outline" role="button" className="hover:bg-muted/50">
          <ItemMedia>
            <div className="text-muted-foreground flex h-5 w-5 items-center justify-center">
              <OauthProviderLogoImage providerId={'email'} />
            </div>
          </ItemMedia>

          <ItemContent>
            <ItemHeader>
              <div className="flex flex-col">
                <ItemTitle className="text-sm font-medium">
                  <Trans i18nKey={'account:setEmailAddress'} />
                </ItemTitle>

                <ItemDescription>
                  <Trans i18nKey={'account:setEmailDescription'} />
                </ItemDescription>
              </div>
            </ItemHeader>
          </ItemContent>
        </Item>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'account:setEmailAddress'} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={'account:setEmailDescription'} />
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Item variant="outline" role="button" className="hover:bg-muted/50">
          <ItemMedia>
            <div className="text-muted-foreground flex h-5 w-5 items-center justify-center">
              <OauthProviderLogoImage providerId={'password'} />
            </div>
          </ItemMedia>

          <ItemContent>
            <ItemHeader>
              <div className="flex flex-col">
                <ItemTitle className="text-sm font-medium">
                  <Trans i18nKey={'account:linkEmailPassword'} />
                </ItemTitle>

                <ItemDescription>
                  <Trans i18nKey={'account:updatePasswordDescription'} />
                </ItemDescription>
              </div>
            </ItemHeader>
          </ItemContent>
        </Item>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'account:linkEmailPassword'} />
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
