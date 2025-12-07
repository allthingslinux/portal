'use client';

import { ConfirmationDialog } from '~/shared/components/confirmation-dialog';

import { deleteUserAction } from '../lib/server/admin-server-actions';
import { DeleteUserSchema } from '../lib/server/schema/admin-actions.schema';

export function AdminDeleteUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>,
) {
  return (
    <ConfirmationDialog
      schema={DeleteUserSchema}
      defaultValues={{ userId: props.userId }}
      title="Delete User"
      description="Are you sure you want to delete this user? All the data associated with this user will be permanently deleted. Any active subscriptions will be canceled."
      buttonText="Delete"
      pendingText="Deleting"
      buttonVariant="destructive"
      confirmationDescription="Are you sure you want to do this? This action cannot be undone."
      errorMessage="There was an error deleting the user. Please check the server logs to see what went wrong."
      testId="admin-delete-user-form"
      onConfirm={deleteUserAction}
    >
      {props.children}
    </ConfirmationDialog>
  );
}
