"use client";

import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useId, useState } from "react";
import type { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn, isRouteActive } from "../lib/utils";
import { SidebarContext } from "./context/sidebar.context";
import { If } from "./if";
import type { NavigationConfigSchema } from "./navigation-config.schema";
import { Trans } from "./trans";

export type SidebarConfig = z.infer<typeof NavigationConfigSchema>;

export { SidebarContext } from "./context/sidebar.context";

/**
 * @deprecated
 * This component is deprecated and will be removed in a future version.
 * Please use the Shadcn Sidebar component instead.
 */
export function Sidebar(props: {
  collapsed?: boolean;
  expandOnHover?: boolean;
  className?: string;
  children:
    | React.ReactNode
    | ((props: {
        collapsed: boolean;
        setCollapsed: (collapsed: boolean) => void;
      }) => React.ReactNode);
}) {
  const [collapsed, setCollapsed] = useState(props.collapsed ?? false);
  const [isExpanded, setIsExpanded] = useState(false);

  const expandOnHover =
    props.expandOnHover ??
    process.env.NEXT_PUBLIC_EXPAND_SIDEBAR_ON_HOVER === "true";

  const sidebarSizeClassName = getSidebarSizeClassName(collapsed, isExpanded);

  const className = getClassNameBuilder(
    cn(props.className ?? "", sidebarSizeClassName, {})
  )();

  const containerClassName = cn(sidebarSizeClassName, "bg-inherit", {
    "max-w-[4rem]": expandOnHover && isExpanded,
  });

  const ctx = { collapsed, setCollapsed };

  const onMouseEnter =
    props.collapsed && expandOnHover
      ? () => {
          setCollapsed(false);
          setIsExpanded(true);
        }
      : undefined;

  const onMouseLeave =
    props.collapsed && expandOnHover
      ? () => {
          if (isRadixPopupOpen()) {
            onRadixPopupClose(() => {
              setCollapsed(true);
              setIsExpanded(false);
            });
          } else {
            setCollapsed(true);
            setIsExpanded(false);
          }
        }
      : undefined;

  return (
    <SidebarContext.Provider value={ctx}>
      <button
        aria-expanded={!collapsed}
        aria-label="Sidebar"
        className={containerClassName}
        onBlur={onMouseLeave}
        onFocus={onMouseEnter}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        type="button"
      >
        <div className={className}>
          {typeof props.children === "function"
            ? props.children(ctx)
            : props.children}
        </div>
      </button>
    </SidebarContext.Provider>
  );
}

export function SidebarContent({
  children,
  className: customClassName,
}: React.PropsWithChildren<{
  className?: string;
}>) {
  const { collapsed } = useContext(SidebarContext);

  const className = cn(
    "flex w-full flex-col space-y-1.5 py-1",
    customClassName,
    {
      "px-4": !collapsed,
      "px-2": collapsed,
    }
  );

  return <div className={className}>{children}</div>;
}

function SidebarGroupWrapper({
  id,
  sidebarCollapsed,
  collapsible,
  isGroupCollapsed,
  setIsGroupCollapsed,
  label,
}: {
  id: string;
  sidebarCollapsed: boolean;
  collapsible: boolean;
  isGroupCollapsed: boolean;
  setIsGroupCollapsed: (isGroupCollapsed: boolean) => void;
  label: React.ReactNode;
}) {
  const className = cn(
    "group flex items-center justify-between space-x-2.5 px-container",
    {
      "py-2.5": !sidebarCollapsed,
    }
  );

  if (collapsible) {
    return (
      <button
        aria-controls={id}
        aria-expanded={!isGroupCollapsed}
        className={className}
        onClick={() => setIsGroupCollapsed(!isGroupCollapsed)}
        type="button"
      >
        <span
          className={"font-semibold text-muted-foreground text-xs uppercase"}
        >
          {label}
        </span>

        <If condition={collapsible}>
          <ChevronDown
            className={cn("h-3 transition duration-300", {
              "rotate-180": !isGroupCollapsed,
            })}
          />
        </If>
      </button>
    );
  }

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <div className={className}>
      <span className={"font-semibold text-muted-foreground text-xs uppercase"}>
        {label}
      </span>
    </div>
  );
}

export function SidebarGroup({
  label,
  collapsed = false,
  collapsible = true,
  children,
}: React.PropsWithChildren<{
  label: string | React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
}>) {
  const { collapsed: sidebarCollapsed } = useContext(SidebarContext);
  const [isGroupCollapsed, setIsGroupCollapsed] = useState(collapsed);
  const id = useId();

  return (
    <div
      className={cn("flex flex-col", {
        "gap-y-2 py-1": !collapsed,
      })}
    >
      <SidebarGroupWrapper
        collapsible={collapsible}
        id={id}
        isGroupCollapsed={isGroupCollapsed}
        label={label}
        setIsGroupCollapsed={setIsGroupCollapsed}
        sidebarCollapsed={sidebarCollapsed}
      />

      <If condition={collapsible ? !isGroupCollapsed : true}>
        <div className={"flex flex-col space-y-1.5"} id={id}>
          {children}
        </div>
      </If>
    </div>
  );
}

export function SidebarDivider() {
  return (
    <div className={"my-2 border-gray-100 border-t dark:border-dark-800"} />
  );
}

export function SidebarItem({
  end,
  path,
  children,
  Icon,
}: React.PropsWithChildren<{
  path: string;
  Icon: React.ReactNode;
  end?: boolean | ((path: string) => boolean);
}>) {
  const { collapsed } = useContext(SidebarContext);
  const currentPath = usePathname() ?? "";

  const active = isRouteActive(path, currentPath, end ?? false);
  const variant = active ? "secondary" : "ghost";

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip disableHoverableContent>
        <TooltipTrigger asChild>
          <Button
            asChild
            className={cn(
              "flex w-full text-sm shadow-none active:bg-secondary/60",
              {
                "justify-start space-x-2.5": !collapsed,
                "hover:bg-initial": active,
              }
            )}
            size={"sm"}
            variant={variant}
          >
            <Link href={path}>
              {Icon}
              <span
                className={cn("w-auto transition-opacity duration-300", {
                  "w-0 opacity-0": collapsed,
                })}
              >
                {children}
              </span>
            </Link>
          </Button>
        </TooltipTrigger>

        <If condition={collapsed}>
          <TooltipContent side={"right"} sideOffset={10}>
            {children}
          </TooltipContent>
        </If>
      </Tooltip>
    </TooltipProvider>
  );
}

function getClassNameBuilder(className: string) {
  return cva([
    cn(
      "group/sidebar fixed box-content flex h-screen w-2/12 flex-col bg-inherit backdrop-blur-xs transition-width duration-200",
      className
    ),
  ]);
}

function getSidebarSizeClassName(collapsed: boolean, isExpanded: boolean) {
  return cn(["z-50 flex w-full flex-col"], {
    "lg:w-[17rem] dark:shadow-primary/20": !collapsed,
    "lg:w-[4rem]": collapsed,
    shadow: isExpanded,
  });
}

function getRadixPopup() {
  return document.querySelector("[data-radix-popper-content-wrapper]");
}

function isRadixPopupOpen() {
  return getRadixPopup() !== null;
}

function onRadixPopupClose(callback: () => void) {
  const element = getRadixPopup();

  if (element) {
    const observer = new MutationObserver(() => {
      if (!getRadixPopup()) {
        callback();

        observer.disconnect();
      }
    });

    const parentElement = element.parentElement;
    if (!parentElement) {
      return;
    }

    observer.observe(parentElement, {
      childList: true,
      subtree: true,
    });
  }
}

export function SidebarNavigation({
  config,
}: React.PropsWithChildren<{
  config: SidebarConfig;
}>) {
  return (
    <>
      {config.routes.map((item, index) => {
        if ("divider" in item) {
          const dividerLabel = "label" in item ? item.label : undefined;
          return (
            <SidebarDivider key={String(dividerLabel ?? `divider-${index}`)} />
          );
        }

        if ("children" in item) {
          return (
            <SidebarGroup
              collapsed={item.collapsed}
              collapsible={item.collapsible}
              key={item.label || `group-${index}`}
              label={<Trans defaults={item.label} i18nKey={item.label} />}
            >
              {item.children.map((child) => {
                if ("collapsible" in child && child.collapsible) {
                  throw new Error(
                    "Collapsible groups are not supported in the old Sidebar. Please migrate to the new Sidebar."
                  );
                }

                if ("path" in child) {
                  return (
                    <SidebarItem
                      end={child.end}
                      Icon={child.Icon}
                      key={child.path}
                      path={child.path}
                    >
                      <Trans defaults={child.label} i18nKey={child.label} />
                    </SidebarItem>
                  );
                }

                return null;
              })}
            </SidebarGroup>
          );
        }

        return null;
      })}
    </>
  );
}
