import { cn } from "@/shared/utils/index";

export function PageContent({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col space-y-4 overflow-auto p-3 sm:space-y-6 sm:p-4 md:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
