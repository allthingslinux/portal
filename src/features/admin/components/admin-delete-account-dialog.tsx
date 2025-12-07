'use client';

import { ConfirmationDialog } from '~/shared/components/confirmation-dialog';

import { deleteAccountAction } from '../lib/server/admin-server-actions';
import { DeleteAccountSchema } from '../lib/server/schema/admin-actions.schema';

export function AdminDeleteAccountDialog(
  props: React.PropsWithChildren<{
    accountId: string;
  }>,
) {
  return (
    <ConfirmationDialog
      schema={DeleteAccountSchema}
      defaultValues={{ accountId: props.accountId }}
      title="Delete Account"
      description="Are you sure you want to delete this account? All the data associated with this account will be permanently deleted. Any active subscriptions will be canceled."
      buttonText="Delete"
      pendingText="Deleting"
      buttonVariant="destructive"
      confirmationDescription="Are you sure you want to do this? This action cannot be undone."
      errorMessage="There was an error deleting the account. Please check the server logs to see what went wrong."
      testId="admin-delete-account-form"
      onConfirm={deleteAccountAction}
    >
      {props.children}
    </ConfirmationDialog>
  );
}
