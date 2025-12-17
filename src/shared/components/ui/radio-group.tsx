"use client";

import { CheckIcon } from "@radix-ui/react-icons";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "../lib/utils";

const RadioGroup: React.FC<
  React.ComponentPropsWithRef<typeof RadioGroupPrimitive.Root>
> = ({ className, ...props }) => (
  <RadioGroupPrimitive.Root
    className={cn("grid gap-2", className)}
    {...props}
  />
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem: React.FC<
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
> = ({ className, ...props }) => (
  <RadioGroupPrimitive.Item
    className={cn(
      "aspect-square h-4 w-4 rounded-full border border-primary text-primary focus:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <CheckIcon className="fade-in slide-in-from-left-4 h-3.5 w-3.5 animate-in fill-primary" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

const RadioGroupItemLabel = (
  props: React.PropsWithChildren<{
    className?: string;
    selected?: boolean;
    htmlFor?: string;
  }>
) => (
  <label
    className={cn(
      props.className,
      "flex cursor-pointer rounded-md" +
        "items-center space-x-4 border border-input" +
        "p-2.5 text-sm transition-all focus-within:border-primary active:bg-muted",
      {
        "bg-muted/70": props.selected,
        "hover:bg-muted/50": !props.selected,
      }
    )}
    data-selected={props.selected}
    htmlFor={props.htmlFor}
  >
    {props.children}
  </label>
);
RadioGroupItemLabel.displayName = "RadioGroupItemLabel";

export { RadioGroup, RadioGroupItem, RadioGroupItemLabel };
