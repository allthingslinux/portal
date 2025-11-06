'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Mail, Plus, X } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form';
import { If } from '~/components/makerkit/if';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '~/components/ui/input-group';
import { toast } from '~/components/ui/sonner';
import { Spinner } from '~/components/makerkit/spinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { Trans } from '~/components/makerkit/trans';

import { InviteMembersSchema } from '../../schema/invite-members.schema';
import { createInvitationsAction } from '../../server/actions/team-invitations-server-actions';
import { MembershipRoleSelector } from './membership-role-selector';
import { RolesDataProvider } from './roles-data-provider';

type InviteModel = ReturnType<typeof createEmptyInviteModel>;

type Role = string;

/**
 * The maximum number of invites that can be sent at once.
 * Useful to avoid spamming the server with too large payloads
 */
const MAX_INVITES = 5;

export function InviteMembersDialogContainer({
  accountSlug,
  userRoleHierarchy,
  children,
}: React.PropsWithChildren<{
  accountSlug: string;
  userRoleHierarchy: number;
}>) {
  const [pending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('teams');

  // Evaluate policies when dialog is open
  const {
    data: policiesResult,
    isLoading: isLoadingPolicies,
    error: policiesError,
  } = useFetchInvitationsPolicies({ accountSlug, isOpen });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={'teams:inviteMembersHeading'} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={'teams:inviteMembersDescription'} />
          </DialogDescription>
        </DialogHeader>

        <If condition={isLoadingPolicies}>
          <div className="flex flex-col items-center justify-center gap-y-4 py-8">
            <Spinner className="h-6 w-6" />

            <span className="text-muted-foreground text-sm">
              <Trans i18nKey="teams:checkingPolicies" />
            </span>
          </div>
        </If>

        <If condition={policiesError}>
          <Alert variant="destructive">
            <AlertDescription>
              <Trans
                i18nKey="teams:policyCheckError"
                values={{ error: policiesError?.message }}
              />
            </AlertDescription>
          </Alert>
        </If>

        <If condition={policiesResult && !policiesResult.allowed}>
          <Alert variant="destructive">
            <AlertDescription>
              <Trans
                i18nKey={policiesResult?.reasons[0]}
                defaults={policiesResult?.reasons[0]}
              />
            </AlertDescription>
          </Alert>
        </If>

        <If condition={policiesResult?.allowed}>
          <RolesDataProvider maxRoleHierarchy={userRoleHierarchy}>
            {(roles) => (
              <InviteMembersForm
                pending={pending}
                roles={roles}
                onSubmit={(data) => {
                  startTransition(async () => {
                    const toastId = toast.loading(t('invitingMembers'));

                    const result = await createInvitationsAction({
                      accountSlug,
                      invitations: data.invitations,
                    });

                    if (result.success) {
                      toast.success(t('inviteMembersSuccessMessage'), {
                        id: toastId,
                      });
                    } else {
                      toast.error(t('inviteMembersErrorMessage'), {
                        id: toastId,
                      });
                    }

                    setIsOpen(false);
                  });
                }}
              />
            )}
          </RolesDataProvider>
        </If>
      </DialogContent>
    </Dialog>
  );
}

function InviteMembersForm({
  onSubmit,
  roles,
  pending,
}: {
  onSubmit: (data: { invitations: InviteModel[] }) => void;
  pending: boolean;
  roles: string[];
}) {
  const { t } = useTranslation('teams');

  const form = useForm({
    resolver: zodResolver(InviteMembersSchema),
    shouldUseNativeValidation: true,
    reValidateMode: 'onSubmit',
    defaultValues: {
      invitations: [createEmptyInviteModel()],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: 'invitations',
  });

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-8'}
        data-test={'invite-members-form'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-y-2.5">
          {fieldArray.fields.map((field, index) => {
            const emailInputName = `invitations.${index}.email` as const;
            const roleInputName = `invitations.${index}.role` as const;

            return (
              <div data-test={'invite-member-form-item'} key={field.id}>
                <div className={'flex items-end gap-x-2'}>
                  <InputGroup className={'bg-background w-full'}>
                    <InputGroupAddon align="inline-start">
                      <Mail className="h-4 w-4" />
                    </InputGroupAddon>

                    <FormField
                      name={emailInputName}
                      render={({ field }) => {
                        return (
                          <FormItem className="w-full">
                            <FormControl>
                              <InputGroupInput
                                data-test={'invite-email-input'}
                                placeholder={t('emailPlaceholder')}
                                type="email"
                                required
                                {...field}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </InputGroup>

                  <FormField
                    name={roleInputName}
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormControl>
                            <MembershipRoleSelector
                              triggerClassName={'m-0 bg-muted'}
                              roles={roles}
                              value={field.value}
                              onChange={(role) => {
                                form.setValue(field.name, role);
                              }}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <div className={'flex items-end justify-end'}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={'ghost'}
                            size={'icon'}
                            type={'button'}
                            disabled={fieldArray.fields.length <= 1}
                            data-test={'remove-invite-button'}
                            aria-label={t('removeInviteButtonLabel')}
                            onClick={() => {
                              fieldArray.remove(index);
                              form.clearErrors(emailInputName);
                            }}
                          >
                            <X className={'h-4'} />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>
                          {t('removeInviteButtonLabel')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            );
          })}

          <If condition={fieldArray.fields.length < MAX_INVITES}>
            <div>
              <Button
                data-test={'add-new-invite-button'}
                type={'button'}
                variant={'link'}
                size={'sm'}
                disabled={pending}
                onClick={() => {
                  fieldArray.append(createEmptyInviteModel());
                }}
              >
                <Plus className={'mr-1 h-3'} />

                <span>
                  <Trans i18nKey={'teams:addAnotherMemberButtonLabel'} />
                </span>
              </Button>
            </div>
          </If>
        </div>

        <Button type={'submit'} disabled={pending}>
          <Trans
            i18nKey={
              pending
                ? 'teams:invitingMembers'
                : 'teams:inviteMembersButtonLabel'
            }
          />
        </Button>
      </form>
    </Form>
  );
}

function createEmptyInviteModel() {
  return { email: '', role: 'member' as Role };
}

function useFetchInvitationsPolicies({
  accountSlug,
  isOpen,
}: {
  accountSlug: string;
  isOpen: boolean;
}) {
  return useQuery({
    queryKey: ['invitation-policies', accountSlug],
    queryFn: async () => {
      const response = await fetch(`./members/policies`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
