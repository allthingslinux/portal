"use client";

import { ConfirmationDialog } from "~/components/confirmation-dialog";

import { reactivateUserAction } from "~/features/admin/lib/server/admin-server-actions";
import { ReactivateUserSchema } from "~/features/admin/lib/server/schema/admin-actions.schema";

export function AdminReactivateUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>
) {
  return (
    <ConfirmationDialog
      buttonText="Reactivate User"
      defaultValues={{ userId: props.userId }}
      description="Are you sure you want to reactivate this user?"
      errorMessage="There was an error reactivating the user. Please check the server logs to see what went wrong."
      onConfirm={reactivateUserAction}
      pendingText="Reactivating"
      schema={ReactivateUserSchema}
      testId="admin-reactivate-user-form"
      title="Reactivate User"
    >
      {props.children}
    </ConfirmationDialog>
  );
}
