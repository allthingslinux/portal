'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { If } from '~/components/makerkit/if';
import { Input } from '~/components/ui/input';
import { toast } from '~/components/ui/sonner';

import { resetPasswordAction } from '../lib/server/admin-server-actions';

const FormSchema = z.object({
  userId: z.string().uuid(),
  confirmation: z.custom<string>((value) => value === 'CONFIRM'),
});

export function AdminResetPasswordDialog(
  props: React.PropsWithChildren<{
    userId: string;
  }>,
) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      userId: props.userId,
      confirmation: '',
    },
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = form.handleSubmit((data) => {
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      try {
        await resetPasswordAction(data);

        setSuccess(true);
        form.reset({ userId: props.userId, confirmation: '' });

        toast.success('Password reset email successfully sent');
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));

        toast.error('We hit an error. Please read the logs.');
      }
    });
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Send a Reset Password Email</AlertDialogTitle>

          <AlertDialogDescription>
            Do you want to send a reset password email to this user?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="relative">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmation</FormLabel>

                    <FormDescription>
                      Type CONFIRM to execute this request.
                    </FormDescription>

                    <FormControl>
                      <Input
                        placeholder="CONFIRM"
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <If condition={!!error}>
                <Alert variant="destructive">
                  <AlertTitle>
                    We encountered an error while sending the email
                  </AlertTitle>

                  <AlertDescription>
                    Please check the server logs for more details.
                  </AlertDescription>
                </Alert>
              </If>

              <If condition={success}>
                <Alert>
                  <AlertTitle>
                    Password reset email sent successfully
                  </AlertTitle>

                  <AlertDescription>
                    The password reset email has been sent to the user.
                  </AlertDescription>
                </Alert>
              </If>

              <input type="hidden" name="userId" value={props.userId} />

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Cancel
                </AlertDialogCancel>

                <Button
                  type="submit"
                  disabled={isPending}
                  variant="destructive"
                >
                  {isPending ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
