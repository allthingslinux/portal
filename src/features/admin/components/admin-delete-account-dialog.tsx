"use client";

import { ConfirmationDialog } from "~/components/confirmation-dialog";

import { deleteAccountAction } from "~/features/admin/lib/server/admin-server-actions";
import { DeleteAccountSchema } from "~/features/admin/lib/server/schema/admin-actions.schema";

export function AdminDeleteAccountDialog(
  props: React.PropsWithChildren<{
    accountId: string;
  }>
) {
  return (
    <ConfirmationDialog
      buttonText="Delete"
      buttonVariant="destructive"
      confirmationDescription="Are you sure you want to do this? This action cannot be undone."
      defaultValues={{ accountId: props.accountId }}
      description="Are you sure you want to delete this account? All the data associated with this account will be permanently deleted. Any active subscriptions will be canceled."
      errorMessage="There was an error deleting the account. Please check the server logs to see what went wrong."
      onConfirm={deleteAccountAction}
      pendingText="Deleting"
      schema={DeleteAccountSchema}
      testId="admin-delete-account-form"
      title="Delete Account"
    >
      {props.children}
    </ConfirmationDialog>
  );
}
