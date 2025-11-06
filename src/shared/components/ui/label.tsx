'use client';

import * as React from 'react';

import { type VariantProps, cva } from 'class-variance-authority';
import { Label as LabelPrimitive } from 'radix-ui';

import { cn } from '../lib/utils';

const labelVariants = cva(
  'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const Label: React.FC<
  React.ComponentPropsWithRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
> = ({ className, ...props }) => (
  <LabelPrimitive.Root className={cn(labelVariants(), className)} {...props} />
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
