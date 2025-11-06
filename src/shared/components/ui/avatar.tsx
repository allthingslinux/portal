'use client';

import * as React from 'react';

import { Avatar as AvatarPrimitive } from 'radix-ui';

import { cn } from '../lib/utils';

const Avatar: React.FC<
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
> = ({ className, ...props }) => (
  <AvatarPrimitive.Root
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage: React.FC<
  React.ComponentPropsWithRef<typeof AvatarPrimitive.Image>
> = ({ className, ...props }) => (
  <AvatarPrimitive.Image
    className={cn('aspect-square h-full w-full object-cover', className)}
    {...props}
  />
);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback: React.FC<
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
> = ({ className, ...props }) => (
  <AvatarPrimitive.Fallback
    className={cn(
      'bg-muted flex h-full w-full items-center justify-center rounded-full',
      className,
    )}
    {...props}
  />
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
