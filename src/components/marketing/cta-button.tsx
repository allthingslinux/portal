import { cn } from "~/components/lib/utils";
import { Button } from "~/components/ui/button";

export const CtaButton: React.FC<React.ComponentProps<typeof Button>> =
  function CtaButtonComponent({ className, children, ...props }) {
    return (
      <Button
        asChild
        className={cn(
          "h-12 rounded-xl px-4 font-semibold text-base",
          className,
          {
            "transition-all hover:shadow-2xl dark:shadow-primary/30":
              props.variant === "default" || !props.variant,
          }
        )}
        {...props}
      >
        {children}
      </Button>
    );
  };
