"use client";

import { ConfirmationDialog } from "~/shared/components/confirmation-dialog";

import { banUserAction } from "../lib/server/admin-server-actions";
import { BanUserSchema } from "../lib/server/schema/admin-actions.schema";

export function AdminBanUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>
) {
  return (
    <ConfirmationDialog
      buttonText="Ban User"
      buttonVariant="destructive"
      defaultValues={{ userId: props.userId }}
      description="Are you sure you want to ban this user? Please note that the user will stay logged in until their session expires."
      errorMessage="There was an error banning the user. Please check the server logs to see what went wrong."
      onConfirm={banUserAction}
      pendingText="Banning"
      schema={BanUserSchema}
      testId="admin-ban-user-form"
      title="Ban User"
    >
      {props.children}
    </ConfirmationDialog>
  );
}
