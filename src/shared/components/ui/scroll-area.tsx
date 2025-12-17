"use client";

import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "../lib/utils";

const ScrollArea: React.FC<
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
> = ({ className, children, ...props }) => (
  <ScrollAreaPrimitive.Root
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar: React.FC<
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
> = ({ className, orientation = "vertical", ...props }) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 border-t border-t-transparent p-[1px]",
      className
    )}
    orientation={orientation}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
