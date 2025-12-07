'use client';

import { ConfirmationDialog } from '~/shared/components/confirmation-dialog';

import { banUserAction } from '../lib/server/admin-server-actions';
import { BanUserSchema } from '../lib/server/schema/admin-actions.schema';

export function AdminBanUserDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>,
) {
  return (
    <ConfirmationDialog
      schema={BanUserSchema}
      defaultValues={{ userId: props.userId }}
      title="Ban User"
      description="Are you sure you want to ban this user? Please note that the user will stay logged in until their session expires."
      buttonText="Ban User"
      pendingText="Banning"
      buttonVariant="destructive"
      errorMessage="There was an error banning the user. Please check the server logs to see what went wrong."
      testId="admin-ban-user-form"
      onConfirm={banUserAction}
    >
      {props.children}
    </ConfirmationDialog>
  );
}
