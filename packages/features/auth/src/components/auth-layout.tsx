import { cn } from '@portal/ui/utils';

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
        'bg-background lg:bg-muted/30 animate-in fade-in slide-in-from-top-16 zoom-in-95 flex h-screen flex-col items-center justify-center gap-y-10 duration-1000 lg:gap-y-8',
        className,
      )}
    >
      {Logo ? <Logo /> : null}

      <div
        className={cn(
          'bg-background flex w-full max-w-[22rem] flex-col gap-y-6 rounded-lg px-6 md:w-8/12 md:px-8 md:py-6 lg:w-5/12 lg:px-8 xl:w-4/12 xl:py-8',
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
