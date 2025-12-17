"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Trans } from "~/components/portal/trans";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { DialogErrorAlert } from "~/shared/components/ui/dialog-error-alert";
import { useDialogForm } from "~/shared/hooks/use-dialog-form";

import { CreateTeamSchema } from "../schema/create-team.schema";
import { createTeamAccountAction } from "../server/actions/team-account-server-actions";

export function CreateTeamAccountDialog(
  props: React.PropsWithChildren<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }>
) {
  return (
    <Dialog onOpenChange={props.setIsOpen} open={props.isOpen}>
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={"teams:createTeamModalHeading"} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={"teams:createTeamModalDescription"} />
          </DialogDescription>
        </DialogHeader>

        <CreateOrganizationAccountForm onClose={() => props.setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CreateOrganizationAccountForm(props: { onClose: () => void }) {
  const form = useForm<z.infer<typeof CreateTeamSchema>>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(CreateTeamSchema),
  });

  const { error, pending, handleSubmit } = useDialogForm(
    createTeamAccountAction,
    {
      onSuccess: props.onClose,
    }
  );

  return (
    <Form {...form}>
      <form
        data-test={"create-team-form"}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className={"flex flex-col space-y-4"}>
          <DialogErrorAlert
            descriptionKey="teams:createTeamErrorMessage"
            error={error}
            titleKey="teams:createTeamErrorHeading"
          />

          <FormField
            name={"name"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey={"teams:teamNameLabel"} />
                </FormLabel>

                <FormControl>
                  <Input
                    data-test={"create-team-name-input"}
                    maxLength={50}
                    minLength={2}
                    placeholder={""}
                    required
                    {...field}
                  />
                </FormControl>

                <FormDescription>
                  <Trans i18nKey={"teams:teamNameDescription"} />
                </FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className={"flex justify-end space-x-2"}>
            <Button
              disabled={pending}
              onClick={props.onClose}
              type={"button"}
              variant={"outline"}
            >
              <Trans i18nKey={"common:cancel"} />
            </Button>

            <Button data-test={"confirm-create-team-button"} disabled={pending}>
              {pending ? (
                <Trans i18nKey={"teams:creatingTeam"} />
              ) : (
                <Trans i18nKey={"teams:createTeamSubmitLabel"} />
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
