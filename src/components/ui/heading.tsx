import { cn } from "~/components/lib/utils";

type Level = 1 | 2 | 3 | 4 | 5 | 6;

export function Heading({
  level,
  children,
  className,
}: React.PropsWithChildren<{ level?: Level; className?: string }>) {
  switch (level) {
    case 1:
      return (
        <h1
          className={cn(
            "scroll-m-20 font-bold font-heading text-3xl tracking-tight lg:text-4xl dark:text-white",
            className
          )}
        >
          {children}
        </h1>
      );
    case 2:
      return (
        <h2
          className={cn(
            "scroll-m-20 pb-2 font-heading font-semibold text-2xl tracking-tight transition-colors first:mt-0 lg:text-3xl",
            className
          )}
        >
          {children}
        </h2>
      );
    case 3:
      return (
        <h3
          className={cn(
            "scroll-m-20 font-heading font-semibold text-xl tracking-tight lg:text-2xl",
            className
          )}
        >
          {children}
        </h3>
      );
    case 4:
      return (
        <h4
          className={cn(
            "scroll-m-20 font-heading font-semibold text-lg tracking-tight lg:text-xl",
            className
          )}
        >
          {children}
        </h4>
      );
    case 5:
      return (
        <h5
          className={cn(
            "scroll-m-20 font-heading font-medium text-base lg:text-lg",
            className
          )}
        >
          {children}
        </h5>
      );
    case 6:
      return (
        <h6
          className={cn(
            "scroll-m-20 font-heading font-medium text-base",
            className
          )}
        >
          {children}
        </h6>
      );

    default:
      return <Heading level={1}>{children}</Heading>;
  }
}
