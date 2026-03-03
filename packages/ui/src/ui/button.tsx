"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "@portal/utils/utils";
import { buttonVariants, type ButtonVariants } from "./button-variants";

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & ButtonVariants) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      render={render}
      nativeButton={nativeButton ?? (render === undefined)}
      {...props}
    />
  )
}

export { Button };
export { buttonVariants } from "./button-variants";
