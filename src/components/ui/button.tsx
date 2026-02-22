"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";

import { cn } from "@/shared/utils/index";
import { buttonVariants, type ButtonVariants } from "./button-variants";

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & ButtonVariants) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button };
export { buttonVariants } from "./button-variants";
