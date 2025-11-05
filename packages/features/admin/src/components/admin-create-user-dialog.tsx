'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@portal/ui/alert';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@portal/ui/alert-dialog';
import { Button } from '@portal/ui/button';
import { Checkbox } from '@portal/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@portal/ui/form';
import { If } from '@portal/ui/if';
import { Input } from '@portal/ui/input';
import { toast } from '@portal/ui/sonner';

import { createUserAction } from '../lib/server/admin-server-actions';
import {
  CreateUserSchema,
  CreateUserSchemaType,
} from '../lib/server/schema/create-user.schema';

export function AdminCreateUserDialog(props: React.PropsWithChildren) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<CreateUserSchemaType>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: '',
      password: '',
      emailConfirm: false,
    },
    mode: 'onChange',
  });

  const onSubmit = (data: CreateUserSchemaType) => {
    startTransition(async () => {
      try {
        const result = await createUserAction(data);

        if (result.success) {
          toast.success('User creates successfully');
          form.reset();

          setOpen(false);
        }

        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error');
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{props.children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New User</AlertDialogTitle>

          <AlertDialogDescription>
            Complete the form below to create a new user.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            data-test={'admin-create-user-form'}
            className={'flex flex-col space-y-4'}
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <If condition={!!error}>
              <Alert variant={'destructive'}>
                <AlertTitle>Error</AlertTitle>

                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </If>

            <FormField
              name={'email'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <FormControl>
                    <Input
                      required
                      type="email"
                      placeholder={'user@example.com'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name={'password'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>

                  <FormControl>
                    <Input
                      required
                      type="password"
                      placeholder={'Password'}
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    Password must be at least 8 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name={'emailConfirm'}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>

                  <div className="flex flex-col space-y-1">
                    <FormLabel>Auto-confirm email</FormLabel>

                    <FormDescription>
                      If checked, the user&apos;s email will be automatically
                      confirmed.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <Button disabled={pending} type={'submit'}>
                {pending ? 'Creating...' : 'Create User'}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
