import * as React from 'react';

import { ChevronRight } from 'lucide-react';
import { Slot } from 'radix-ui';

import { cn } from '../lib/utils';

export const CardButton: React.FC<
  {
    asChild?: boolean;
    className?: string;
    children: React.ReactNode;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = function CardButton({ className, asChild, ...props }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      className={cn(
        'group hover:bg-secondary/20 active:bg-secondary active:bg-secondary/50 dark:shadow-primary/20 relative flex h-36 flex-col rounded-lg border transition-all hover:shadow-xs active:shadow-lg',
        className,
      )}
      {...props}
    >
      <Slot.Slottable>{props.children}</Slot.Slottable>
    </Comp>
  );
};

export const CardButtonTitle: React.FC<
  {
    asChild?: boolean;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>
> = function CardButtonTitle({ className, asChild, ...props }) {
  const Comp = asChild ? Slot.Root : 'div';

  return (
    <Comp
      className={cn(
        className,
        'text-muted-foreground group-hover:text-secondary-foreground align-super text-sm font-medium transition-colors',
      )}
      {...props}
    >
      <Slot.Slottable>{props.children}</Slot.Slottable>
    </Comp>
  );
};

export const CardButtonHeader: React.FC<
  {
    children: React.ReactNode;
    asChild?: boolean;
    displayArrow?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>
> = function CardButtonHeader({
  className,
  asChild,
  displayArrow = true,
  ...props
}) {
  const Comp = asChild ? Slot.Root : 'div';

  return (
    <Comp className={cn(className, 'p-4')} {...props}>
      <Slot.Slottable>
        {props.children}

        <ChevronRight
          className={cn(
            'text-muted-foreground group-hover:text-secondary-foreground absolute top-4 right-2 h-4 transition-colors',
            {
              hidden: !displayArrow,
            },
          )}
        />
      </Slot.Slottable>
    </Comp>
  );
};

export const CardButtonContent: React.FC<
  {
    asChild?: boolean;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>
> = function CardButtonContent({ className, asChild, ...props }) {
  const Comp = asChild ? Slot.Root : 'div';

  return (
    <Comp className={cn(className, 'flex flex-1 flex-col px-4')} {...props}>
      <Slot.Slottable>{props.children}</Slot.Slottable>
    </Comp>
  );
};

export const CardButtonFooter: React.FC<
  {
    asChild?: boolean;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>
> = function CardButtonFooter({ className, asChild, ...props }) {
  const Comp = asChild ? Slot.Root : 'div';

  return (
    <Comp
      className={cn(
        className,
        'mt-auto flex h-0 w-full flex-col justify-center border-t px-4',
      )}
      {...props}
    >
      <Slot.Slottable>{props.children}</Slot.Slottable>
    </Comp>
  );
};
