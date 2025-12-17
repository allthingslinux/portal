import { Slot } from "radix-ui";

import { cn } from "~/components/lib/utils";

export const GradientSecondaryText: React.FC<
  React.HTMLAttributes<HTMLSpanElement> & {
    asChild?: boolean;
  }
> = function GradientSecondaryTextComponent({ className, ...props }) {
  const Comp = props.asChild ? Slot.Root : "span";

  return (
    <Comp
      className={cn(
        "text-secondary-foreground dark:bg-linear-to-r dark:from-foreground/60 dark:to-foreground dark:bg-clip-text dark:text-transparent",
        className
      )}
      {...props}
    >
      <Slot.Slottable>{props.children}</Slot.Slottable>
    </Comp>
  );
};
