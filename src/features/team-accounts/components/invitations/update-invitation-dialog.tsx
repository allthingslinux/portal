import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { If } from "~/components/portal/if";
import { Trans } from "~/components/portal/trans";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
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

import { RoleSchema } from "../../schema/update-member-role.schema";
import { updateInvitationAction } from "../../server/actions/team-invitations-server-actions";
import { MembershipRoleSelector } from "../members/membership-role-selector";
import { RolesDataProvider } from "../members/roles-data-provider";

type Role = string;

export function UpdateInvitationDialog({
  isOpen,
  setIsOpen,
  invitationId,
  userRole,
  userRoleHierarchy,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  invitationId: number;
  userRole: Role;
  userRoleHierarchy: number;
}) {
  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={"teams:updateMemberRoleModalHeading"} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={"teams:updateMemberRoleModalDescription"} />
          </DialogDescription>
        </DialogHeader>

        <UpdateInvitationForm
          invitationId={invitationId}
          setIsOpen={setIsOpen}
          userRole={userRole}
          userRoleHierarchy={userRoleHierarchy}
        />
      </DialogContent>
    </Dialog>
  );
}

function UpdateInvitationForm({
  invitationId,
  userRole,
  userRoleHierarchy,
  setIsOpen,
}: React.PropsWithChildren<{
  invitationId: number;
  userRole: Role;
  userRoleHierarchy: number;
  setIsOpen: (isOpen: boolean) => void;
}>) {
  const { t } = useTranslation("teams");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<boolean>();

  const onSubmit = ({ role }: { role: Role }) => {
    startTransition(async () => {
      try {
        await updateInvitationAction({
          invitationId,
          role,
        });

        setIsOpen(false);
      } catch {
        setError(true);
      }
    });
  };

  const form = useForm({
    resolver: zodResolver(
      RoleSchema.refine((data) => data.role !== userRole, {
        message: t("roleMustBeDifferent"),
        path: ["role"],
      })
    ),
    reValidateMode: "onChange",
    mode: "onChange",
    defaultValues: {
      role: userRole,
    },
  });

  return (
    <Form {...form}>
      <form
        className={"flex flex-col space-y-6"}
        data-test={"update-invitation-form"}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <If condition={error}>
          <UpdateRoleErrorAlert />
        </If>

        <FormField
          name={"role"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={"teams:roleLabel"} />
              </FormLabel>

              <FormControl>
                <RolesDataProvider maxRoleHierarchy={userRoleHierarchy}>
                  {(roles) => (
                    <MembershipRoleSelector
                      currentUserRole={userRole}
                      onChange={(newRole) => form.setValue(field.name, newRole)}
                      roles={roles}
                      value={field.value}
                    />
                  )}
                </RolesDataProvider>
              </FormControl>

              <FormDescription>
                <Trans i18nKey={"teams:updateRoleDescription"} />
              </FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={pending} type={"submit"}>
          <Trans i18nKey={"teams:updateRoleSubmitLabel"} />
        </Button>
      </form>
    </Form>
  );
}

function UpdateRoleErrorAlert() {
  return (
    <Alert variant={"destructive"}>
      <AlertTitle>
        <Trans i18nKey={"teams:updateRoleErrorHeading"} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={"teams:updateRoleErrorMessage"} />
      </AlertDescription>
    </Alert>
  );
}
