import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "~/components/lib/utils";

const alertVariants = cva(
  "relative flex w-full flex-col gap-y-2 rounded-lg border bg-linear-to-r px-4 py-3.5 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-success/50 text-success dark:border-success [&>svg]:text-success",
        warning:
          "border-warning/50 text-warning dark:border-warning [&>svg]:text-warning",
        info: "border-info/50 text-info dark:border-info [&>svg]:text-info",
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
