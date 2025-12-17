import { Loader2Icon } from "lucide-react";

import { cn } from "../lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      aria-label="Loading"
      className={cn("size-6 animate-spin text-muted-foreground", className)}
      role="status"
      {...props}
    />
  );
}

export { Spinner };
