"use client";

import { DashIcon } from "@radix-ui/react-icons";
import { OTPInput, OTPInputContext } from "input-otp";
import * as React from "react";

import { cn } from "~/components/lib/utils";

const InputOTP: React.FC<React.ComponentPropsWithoutRef<typeof OTPInput>> = ({
  className,
  containerClassName,
  ...props
}) => (
  <OTPInput
    className={cn("disabled:cursor-not-allowed", className)}
    containerClassName={cn(
      "flex items-center gap-2 has-disabled:opacity-50",
      containerClassName
    )}
    {...props}
  />
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup: React.FC<React.ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => <div className={cn("flex items-center", className)} {...props} />;

InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot: React.FC<
  React.ComponentPropsWithRef<"div"> & { index: number }
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
        "relative flex h-9 w-9 items-center justify-center border-input border-y border-r text-sm shadow-xs transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
};
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator: React.FC<React.ComponentPropsWithoutRef<"div">> = ({
  ...props
}) => (
  <span aria-hidden="true" {...props}>
    <DashIcon />
  </span>
);
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
