'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '~/components/lib/utils';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';

const NewsletterFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type NewsletterFormValues = z.infer<typeof NewsletterFormSchema>;

interface NewsletterSignupProps extends React.HTMLAttributes<HTMLDivElement> {
  onSignup: (data: NewsletterFormValues) => void;
  buttonText?: string;
  placeholder?: string;
}

export function NewsletterSignup({
  onSignup,
  buttonText = 'Subscribe',
  placeholder = 'Enter your email',
  className,
  ...props
}: NewsletterSignupProps) {
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(NewsletterFormSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <div className={cn('w-full max-w-sm', className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSignup)}
          className="flex flex-col gap-y-3"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder={placeholder} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {buttonText}
          </Button>
        </form>
      </Form>
    </div>
  );
}
