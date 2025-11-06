'use client';

import * as React from 'react';

import { DashIcon } from '@radix-ui/react-icons';
import { OTPInput, OTPInputContext } from 'input-otp';

import { cn } from '../lib/utils';

const InputOTP: React.FC<React.ComponentPropsWithoutRef<typeof OTPInput>> = ({
  className,
  containerClassName,
  ...props
}) => (
  <OTPInput
    containerClassName={cn(
      'flex items-center gap-2 has-disabled:opacity-50',
      containerClassName,
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
);
InputOTP.displayName = 'InputOTP';

const InputOTPGroup: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  className,
  ...props
}) => <div className={cn('flex items-center', className)} {...props} />;

InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot: React.FC<
  React.ComponentPropsWithRef<'div'> & { index: number }
> = ({ index, className, ...props }) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const slot = inputOTPContext.slots[index];

  if (!slot) {
    return null;
  }

  const { char, isActive, hasFakeCaret } = slot;

  return (
    <div
      className={cn(
        'border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'ring-ring z-10 ring-1',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
};
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  ...props
}) => (
  <div role="separator" {...props}>
    <DashIcon />
  </div>
);
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
