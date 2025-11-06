'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form';
import { If } from '~/components/makerkit/if';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '~/components/ui/input-otp';
import { Spinner } from '~/components/makerkit/spinner';
import { Trans } from '~/components/makerkit/trans';

import { sendOtpEmailAction } from '../server/server-actions';

// Email form schema
const SendOtpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

// OTP verification schema
const VerifyOtpSchema = z.object({
  otp: z.string().min(6, { message: 'Please enter a valid OTP code' }).max(6),
});

type VerifyOtpFormProps = {
  // Purpose of the OTP (e.g., 'email-verification', 'password-reset')
  purpose: string;
  // Callback when OTP is successfully verified
  onSuccess: (otp: string) => void;
  // Email address to send the OTP to
  email: string;
  // Customize form appearance
  className?: string;
  // Optional cancel button
  CancelButton?: React.ReactNode;
};

export function VerifyOtpForm({
  purpose,
  email,
  className,
  CancelButton,
  onSuccess,
}: VerifyOtpFormProps) {
  // Track the current step (email entry or OTP verification)
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isPending, startTransition] = useTransition();

  // Track errors
  const [error, setError] = useState<string | null>(null);
  // Track verification success
  const [, setVerificationSuccess] = useState(false);

  // Email form
  const emailForm = useForm<z.infer<typeof SendOtpSchema>>({
    resolver: zodResolver(SendOtpSchema),
    defaultValues: {
      email,
    },
  });

  // OTP verification form
  const otpForm = useForm<z.infer<typeof VerifyOtpSchema>>({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Handle sending OTP email
  const handleSendOtp = () => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await sendOtpEmailAction({
          purpose,
          email,
        });

        if (result.success) {
          setStep('otp');
        } else {
          setError(result.error || 'Failed to send OTP. Please try again.');
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
        console.error('Error sending OTP:', err);
      }
    });
  };

  // Handle OTP verification
  const handleVerifyOtp = (data: z.infer<typeof VerifyOtpSchema>) => {
    setVerificationSuccess(true);
    onSuccess(data.otp);
  };

  return (
    <div className={className}>
      {step === 'email' ? (
        <Form {...emailForm}>
          <form
            className="flex flex-col gap-y-8"
            onSubmit={emailForm.handleSubmit(handleSendOtp)}
          >
            <div className="flex flex-col gap-y-2">
              <p className="text-muted-foreground text-sm">
                <Trans
                  i18nKey="common:otp.requestVerificationCodeDescription"
                  values={{ email }}
                />
              </p>
            </div>

            <If condition={Boolean(error)}>
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-4 w-4" />

                <AlertTitle>
                  <Trans i18nKey="common:otp.errorSendingCode" />
                </AlertTitle>

                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </If>

            <div className="flex w-full justify-end gap-2">
              {CancelButton}

              <Button
                type="submit"
                disabled={isPending}
                data-test="otp-send-verification-button"
              >
                {isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    <Trans i18nKey="common:otp.sendingCode" />
                  </>
                ) : (
                  <Trans i18nKey="common:otp.sendVerificationCode" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <div className="flex w-full flex-col items-center gap-y-8">
            <div className="text-muted-foreground text-sm">
              <Trans i18nKey="common:otp.codeSentToEmail" values={{ email }} />
            </div>

            <form
              className="flex w-full flex-col items-center space-y-8"
              onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
            >
              <If condition={Boolean(error)}>
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />

                  <AlertTitle>
                    <Trans i18nKey="common:error" />
                  </AlertTitle>

                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </If>

              <FormField
                name="otp"
                control={otpForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        {...field}
                        disabled={isPending}
                        data-test="otp-input"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} data-slot="0" />
                          <InputOTPSlot index={1} data-slot="1" />
                          <InputOTPSlot index={2} data-slot="2" />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} data-slot="3" />
                          <InputOTPSlot index={4} data-slot="4" />
                          <InputOTPSlot index={5} data-slot="5" />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>

                    <FormDescription>
                      <Trans i18nKey="common:otp.enterCodeFromEmail" />
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex w-full justify-between gap-2">
                {CancelButton}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => setStep('email')}
                  >
                    <Trans i18nKey="common:otp.requestNewCode" />
                  </Button>

                  <Button
                    type="submit"
                    disabled={isPending}
                    data-test="otp-verify-button"
                  >
                    {isPending ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        <Trans i18nKey="common:otp.verifying" />
                      </>
                    ) : (
                      <Trans i18nKey="common:otp.verifyCode" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Form>
      )}
    </div>
  );
}
