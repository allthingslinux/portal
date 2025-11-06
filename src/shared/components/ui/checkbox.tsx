'use client';

import * as React from 'react';

import { CheckIcon } from '@radix-ui/react-icons';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

import { cn } from '../lib/utils';

const Checkbox: React.FC<
  React.ComponentPropsWithRef<typeof CheckboxPrimitive.Root>
> = ({ className, ...props }) => (
  <CheckboxPrimitive.Root
    className={cn(
      'peer border-primary focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4 shrink-0 rounded-xs border shadow-xs focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <CheckIcon className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
