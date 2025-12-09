import type * as React from "react";

import { cn } from "../lib/utils";

export type InputProps = React.ComponentPropsWithRef<"input">;

const Input: React.FC<InputProps> = ({
  className,
  type = "text",
  ...props
}) => (
  <input
    className={cn(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-2xs transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground hover:border-ring/50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      className
    )}
    type={type}
    {...props}
  />
);

Input.displayName = "Input";

export { Input };
