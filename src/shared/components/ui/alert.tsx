import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../lib/utils";

const alertVariants = cva(
  "relative flex w-full flex-col gap-y-2 rounded-lg border bg-linear-to-r px-4 py-3.5 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-600/50 text-green-600 dark:border-green-600 [&>svg]:text-green-600",
        warning:
          "border-orange-600/50 text-orange-600 dark:border-orange-600 [&>svg]:text-orange-600",
        info: "border-blue-600/50 text-blue-600 dark:border-blue-600 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert: React.FC<
  React.ComponentPropsWithRef<"div"> & VariantProps<typeof alertVariants>
> = ({ className, variant, ...props }) => (
  <div
    className={cn(alertVariants({ variant }), className)}
    role="alert"
    {...props}
  />
);
Alert.displayName = "Alert";

const AlertTitle: React.FC<React.ComponentPropsWithRef<"h5">> = ({
  className,
  ...props
}) => (
  <h5
    className={cn("font-bold leading-none tracking-tight", className)}
    {...props}
  />
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription: React.FC<React.ComponentPropsWithRef<"div">> = ({
  className,
  ...props
}) => (
  <div
    className={cn("font-normal text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
