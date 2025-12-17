"use client";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Command as CommandPrimitive } from "cmdk";
import type * as React from "react";

import { cn } from "../lib/utils";
import { Dialog, DialogContent } from "./dialog";

const Command: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive>
> = ({ className, ...props }) => (
  <CommandPrimitive
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
);
Command.displayName = CommandPrimitive.displayName;

type CommandDialogProps = React.ComponentProps<typeof Dialog>;

const CommandDialog = ({ children, ...props }: CommandDialogProps) => (
  <Dialog {...props}>
    <DialogContent className="overflow-hidden p-0">
      <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~'[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
        {children}
      </Command>
    </DialogContent>
  </Dialog>
);

const CommandInput: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.Input>
> = ({ className, ...props }) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
);

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.List>
> = ({ className, ...props }) => (
  <CommandPrimitive.List
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
);

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.Empty>
> = (props) => (
  <CommandPrimitive.Empty className="py-6 text-center text-sm" {...props} />
);

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.Group>
> = ({ className, ...props }) => (
  <CommandPrimitive.Group
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs",
      className
    )}
    {...props}
  />
);

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.Separator>
> = ({ className, ...props }) => (
  <CommandPrimitive.Separator
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem: React.FC<
  React.ComponentPropsWithRef<typeof CommandPrimitive.Item>
> = ({ className, ...props }) => (
  <CommandPrimitive.Item
    className={cn(
      "relative flex cursor-default select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
      className
    )}
    {...props}
  />
);

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      "ml-auto text-muted-foreground text-xs tracking-widest",
      className
    )}
    {...props}
  />
);
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
