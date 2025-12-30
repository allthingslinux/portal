"use client";

import { Separator as SeparatorPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "~/components/lib/utils";

const Separator: React.FC<
  React.ComponentPropsWithRef<typeof SeparatorPrimitive.Root>
> = ({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) => (
  <SeparatorPrimitive.Root
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    decorative={decorative}
    orientation={orientation}
    {...props}
  />
);

Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
