import { Slot } from 'radix-ui';

import { cn } from '~/components/lib/utils';
import { GradientSecondaryText } from './gradient-secondary-text';

export const Pill: React.FC<
  React.HTMLAttributes<HTMLHeadingElement> & {
    label?: React.ReactNode;
    asChild?: boolean;
  }
> = function PillComponent({ className, asChild, ...props }) {
  const Comp = asChild ? Slot.Root : 'h3';

  return (
    <Comp
      className={cn(
        'bg-muted/50 flex min-h-10 items-center gap-x-1.5 rounded-full border px-2 py-1 text-center text-sm font-medium text-transparent',
        className,
      )}
      {...props}
    >
      {props.label && (
        <span
          className={
            'text-primary-foreground bg-primary rounded-2xl border px-1.5 py-0.5 text-xs font-bold tracking-tight'
          }
        >
          {props.label}
        </span>
      )}
      <Slot.Slottable>
        <GradientSecondaryText
          className={'flex items-center gap-x-2 font-semibold tracking-tight'}
        >
          {props.children}
        </GradientSecondaryText>
      </Slot.Slottable>
    </Comp>
  );
};

export const PillActionButton: React.FC<
  React.HTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
  }
> = ({ asChild, ...props }) => {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      {...props}
      className={
        'text-secondary-foreground bg-input active:bg-primary active:text-primary-foreground hover:ring-muted-foreground/50 rounded-full px-1.5 py-1.5 text-center text-sm font-medium ring ring-transparent transition-colors'
      }
    >
      {props.children}
    </Comp>
  );
};
