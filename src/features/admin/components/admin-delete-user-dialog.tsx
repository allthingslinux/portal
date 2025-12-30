"use client";

import { ConfirmationDialog } from "~/components/confirmation-dialog";

import { deleteUserAction } from "~/features/admin/lib/server/admin-server-actions";
import { DeleteUserSchema } from "~/features/admin/lib/server/schema/admin-actions.schema";

export function AdminDeleteUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>
) {
  return (
    <ConfirmationDialog
      buttonText="Delete"
      buttonVariant="destructive"
      confirmationDescription="Are you sure you want to do this? This action cannot be undone."
      defaultValues={{ userId: props.userId }}
      description="Are you sure you want to delete this user? All the data associated with this user will be permanently deleted. Any active subscriptions will be canceled."
      errorMessage="There was an error deleting the user. Please check the server logs to see what went wrong."
      onConfirm={deleteUserAction}
      pendingText="Deleting"
      schema={DeleteUserSchema}
      testId="admin-delete-user-form"
      title="Delete User"
    >
      {props.children}
    </ConfirmationDialog>
  );
}
