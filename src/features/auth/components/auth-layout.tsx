import { cn } from "~/components/lib/utils";

export function AuthLayoutShell({
  children,
  className,
  Logo,
  contentClassName,
}: React.PropsWithChildren<{
  Logo?: React.ComponentType;
  className?: string;
  contentClassName?: string;
}>) {
  return (
    <div
      className={cn(
        "fade-in slide-in-from-top-16 zoom-in-95 flex h-screen animate-in flex-col items-center justify-center gap-y-10 bg-background duration-1000 lg:gap-y-8 lg:bg-muted/30",
        className
      )}
    >
      {Logo ? <Logo /> : null}

      <div
        className={cn(
          "flex w-full max-w-(--width-auth-shell) flex-col gap-y-6 rounded-lg bg-background px-6 md:w-8/12 md:px-8 md:py-6 lg:w-5/12 lg:px-8 xl:w-4/12 xl:py-8",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
