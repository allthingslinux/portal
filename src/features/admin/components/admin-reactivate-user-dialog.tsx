'use client';

import { ConfirmationDialog } from '~/shared/components/confirmation-dialog';

import { reactivateUserAction } from '../lib/server/admin-server-actions';
import { ReactivateUserSchema } from '../lib/server/schema/admin-actions.schema';

export function AdminReactivateUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>,
) {
  return (
    <ConfirmationDialog
      schema={ReactivateUserSchema}
      defaultValues={{ userId: props.userId }}
      title="Reactivate User"
      description="Are you sure you want to reactivate this user?"
      buttonText="Reactivate User"
      pendingText="Reactivating"
      errorMessage="There was an error reactivating the user. Please check the server logs to see what went wrong."
      testId="admin-reactivate-user-form"
      onConfirm={reactivateUserAction}
    >
      {props.children}
    </ConfirmationDialog>
  );
}
