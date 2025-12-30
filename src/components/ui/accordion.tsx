"use client";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Accordion as AccordionPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "~/components/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem: React.FC<
  React.ComponentPropsWithRef<typeof AccordionPrimitive.Item>
> = ({ className, ...props }) => (
  <AccordionPrimitive.Item className={cn("border-b", className)} {...props} />
);
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger: React.FC<
  React.ComponentPropsWithRef<typeof AccordionPrimitive.Trigger>
> = ({ className, children, ...props }) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium text-sm transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent: React.FC<
  React.ComponentPropsWithRef<typeof AccordionPrimitive.Content>
> = ({ className, children, ...props }) => (
  <AccordionPrimitive.Content
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pt-0 pb-4", className)}>{children}</div>
  </AccordionPrimitive.Content>
);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
