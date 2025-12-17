import { zodResolver } from "@hookform/resolvers/zod";
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
  DialogTrigger,
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
import { useActionWithError } from "~/shared/hooks/use-action-with-error";

import { RoleSchema } from "../../schema/update-member-role.schema";
import { updateMemberRoleAction } from "../../server/actions/team-members-server-actions";
import { MembershipRoleSelector } from "./membership-role-selector";
import { RolesDataProvider } from "./roles-data-provider";

type Role = string;

export function UpdateMemberRoleDialog({
  children,
  userId,
  teamAccountId,
  userRole,
  userRoleHierarchy,
}: React.PropsWithChildren<{
  userId: string;
  teamAccountId: string;
  userRole: Role;
  userRoleHierarchy: number;
}>) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans i18nKey={"teams:updateMemberRoleModalHeading"} />
          </DialogTitle>

          <DialogDescription>
            <Trans i18nKey={"teams:updateMemberRoleModalDescription"} />
          </DialogDescription>
        </DialogHeader>

        <RolesDataProvider maxRoleHierarchy={userRoleHierarchy}>
          {(data) => (
            <UpdateMemberForm
              roles={data}
              teamAccountId={teamAccountId}
              userId={userId}
              userRole={userRole}
            />
          )}
        </RolesDataProvider>
      </DialogContent>
    </Dialog>
  );
}

function UpdateMemberForm({
  userId,
  userRole,
  teamAccountId,
  roles,
}: React.PropsWithChildren<{
  userId: string;
  userRole: Role;
  teamAccountId: string;
  roles: Role[];
}>) {
  const { pending, error, execute } = useActionWithError();
  const { t } = useTranslation("teams");

  const onSubmit = ({ role }: { role: Role }) => {
    execute(async () => {
      await updateMemberRoleAction({
        accountId: teamAccountId,
        userId,
        role,
      });
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
        data-test={"update-member-role-form"}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <If condition={error}>
          <UpdateRoleErrorAlert />
        </If>

        <FormField
          name={"role"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("roleLabel")}</FormLabel>

              <FormControl>
                <MembershipRoleSelector
                  currentUserRole={userRole}
                  onChange={(newRole) => form.setValue("role", newRole)}
                  roles={roles}
                  value={field.value}
                />
              </FormControl>

              <FormDescription>{t("updateRoleDescription")}</FormDescription>

              <FormMessage />
            </FormItem>
          )}
        />

        <Button data-test={"confirm-update-member-role"} disabled={pending}>
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
