import type React from "react";

import { cn } from "~/components/lib/utils";

export const GradientText: React.FC<React.HTMLAttributes<HTMLSpanElement>> =
  function GradientTextComponent({ className, children, ...props }) {
    return (
      <span
        className={cn(
          "bg-linear-to-r bg-clip-text text-transparent",
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  };
