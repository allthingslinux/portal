import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../lib/utils';

const badgeVariants = cva(
  'focus:ring-ring inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-transparent',
        secondary: 'bg-secondary text-secondary-foreground border-transparent',
        destructive: 'text-destructive border-destructive',
        outline: 'text-foreground',
        success: 'border-green-500 text-green-500',
        warning: 'border-orange-500 text-orange-500',
        info: 'border-blue-500 text-blue-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
