'use client';

import Link from 'next/link';

import { EmailTesterFormSchema } from '@/app/emails/lib/email-tester-form-schema';
import { sendEmailAction } from '@/app/emails/lib/server-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@portal/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@portal/ui/form';
import { Input } from '@portal/ui/input';
import { toast } from '@portal/ui/sonner';
import { Switch } from '@portal/ui/switch';

export function EmailTesterForm(props: {
  template: string;
  settings: {
    username: string;
    password: string;
    sender: string;
    host: string;
    port: number;
    tls: boolean;
  };
}) {
  const form = useForm({
    resolver: zodResolver(EmailTesterFormSchema),
    defaultValues: {
      username: props.settings.username,
      password: props.settings.password,
      sender: props.settings.sender,
      host: props.settings.host,
      port: props.settings.port,
      tls: props.settings.tls,
      to: '',
    },
  });

  return (
    <div className={'flex flex-col space-y-8'}>
      <p className="text-muted-foreground text-sm">
        The settings below were filled from your environment variables. You can
        change them to test different scenarios.{' '}
        <Link className={'underline'} href={'https://www.nodemailer.com'}>
          Learn more about Nodemailer if you're not sure how to configure it.
        </Link>
      </p>

      <Form {...form}>
        <form
          className="flex flex-col space-y-6"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = sendEmailAction({
              template: props.template,
              settings: {
                username: data.username,
                password: data.password,
                sender: data.sender,
                host: data.host,
                port: data.port,
                tls: data.tls,
                to: data.to,
              },
            });

            toast.promise(promise, {
              loading: 'Sending email...',
              success: 'Email sent successfully',
              error: 'Failed to send email',
            });
          })}
        >
          <div className={'flex items-center space-x-2'}>
            <FormField
              name={'sender'}
              render={({ field }) => {
                return (
                  <FormItem className={'w-full'}>
                    <FormLabel>Sender</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={'Sender'} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              name={'to'}
              render={({ field }) => {
                return (
                  <FormItem className={'w-full'}>
                    <FormLabel>Recipient</FormLabel>
                    <FormControl>
                      <Input {...field} type={'email'} placeholder={'to'} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          </div>

          <div className={'flex items-center space-x-2'}>
            <FormField
              name={'username'}
              render={({ field }) => {
                return (
                  <FormItem className={'w-full'}>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={'Username'} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              name={'password'}
              render={({ field }) => {
                return (
                  <FormItem className={'w-full'}>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className={'w-full'}
                        placeholder={'Password'}
                        type={'password'}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          </div>

          <div className={'flex items-center space-x-2'}>
            <FormField
              name={'host'}
              render={({ field }) => {
                return (
                  <FormItem className={'w-full'}>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={'Host'} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              name={'port'}
              render={({ field }) => {
                return (
                  <FormItem className={'w-full'}>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={'Port'} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              name={'tls'}
              render={({ field }) => {
                return (
                  <FormItem className={'w-full'}>
                    <FormLabel>Secure (TLS)</FormLabel>
                    <FormControl>
                      <Switch
                        {...field}
                        onCheckedChange={(value) => {
                          form.setValue('tls', value);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          </div>

          <Button type={'submit'}>Send Test Email</Button>
        </form>
      </Form>
    </div>
  );
}
