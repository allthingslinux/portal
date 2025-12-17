import * as React from "react";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { cn } from "../lib/utils";
import { If } from "./if";

export type PageLayoutStyle = "sidebar" | "header" | "custom";

type PageProps = React.PropsWithChildren<{
  style?: PageLayoutStyle;
  contentContainerClassName?: string;
  className?: string;
  sticky?: boolean;
}>;

const ENABLE_SIDEBAR_TRIGGER = process.env.NEXT_PUBLIC_ENABLE_SIDEBAR_TRIGGER
  ? process.env.NEXT_PUBLIC_ENABLE_SIDEBAR_TRIGGER === "true"
  : true;

export function Page(props: PageProps) {
  switch (props.style) {
    case "header":
      return <PageWithHeader {...props} />;

    case "custom":
      return props.children;

    default:
      return <PageWithSidebar {...props} />;
  }
}

function PageWithSidebar(props: PageProps) {
  const { Navigation, Children, MobileNavigation } = getSlotsFromPage(props);

  return (
    <div className={cn("flex min-w-0 flex-1", props.className)}>
      {Navigation}

      <div
        className={
          props.contentContainerClassName ??
          "mx-auto flex h-screen w-full flex-col bg-inherit"
        }
      >
        {MobileNavigation}

        <div className={"flex flex-1 flex-col bg-background px-4 lg:px-0"}>
          {Children}
        </div>
      </div>
    </div>
  );
}

export function PageMobileNavigation(
  props: React.PropsWithChildren<{
    className?: string;
  }>
) {
  return (
    <div
      className={cn(
        "flex w-full items-center border-b px-4 py-2 lg:hidden lg:px-0",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

function PageWithHeader(props: PageProps) {
  const { Navigation, Children, MobileNavigation } = getSlotsFromPage(props);

  return (
    <div className={cn("flex h-screen flex-1 flex-col", props.className)}>
      <div
        className={
          props.contentContainerClassName ?? "flex flex-1 flex-col space-y-4"
        }
      >
        <div
          className={cn(
            "flex h-14 items-center justify-between bg-muted/40 px-4 lg:justify-start lg:shadow-xs dark:border-border dark:shadow-primary/10",
            {
              "sticky top-0 z-10 backdrop-blur-md": props.sticky ?? true,
            }
          )}
        >
          <div
            className={"hidden w-full flex-1 items-center space-x-8 lg:flex"}
          >
            {Navigation}
          </div>

          {MobileNavigation}
        </div>

        <div className={"container flex flex-1 flex-col"}>{Children}</div>
      </div>
    </div>
  );
}

export function PageBody(
  props: React.PropsWithChildren<{
    className?: string;
  }>
) {
  const className = cn("flex w-full flex-1 flex-col lg:px-4", props.className);

  return <div className={className}>{props.children}</div>;
}

export function PageNavigation(props: React.PropsWithChildren) {
  return <div className={"flex-1 bg-inherit"}>{props.children}</div>;
}

export function PageDescription(props: React.PropsWithChildren) {
  return (
    <div className={"flex h-6 items-center"}>
      <div className={"font-normal text-muted-foreground text-xs leading-none"}>
        {props.children}
      </div>
    </div>
  );
}

export function PageTitle(props: React.PropsWithChildren) {
  return (
    <h1
      className={
        "font-bold font-heading text-base leading-none tracking-tight dark:text-white"
      }
    >
      {props.children}
    </h1>
  );
}

export function PageHeaderActions(props: React.PropsWithChildren) {
  return <div className={"flex items-center space-x-2"}>{props.children}</div>;
}

export function PageHeader({
  children,
  title,
  description,
  className,
  displaySidebarTrigger = ENABLE_SIDEBAR_TRIGGER,
}: React.PropsWithChildren<{
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  displaySidebarTrigger?: boolean;
}>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-5 lg:px-4",
        className
      )}
    >
      <div className={"flex flex-col gap-y-2"}>
        <div className="flex items-center gap-x-2.5">
          {displaySidebarTrigger ? (
            <SidebarTrigger className="hidden h-4.5 w-4.5 cursor-pointer text-muted-foreground hover:text-secondary-foreground lg:inline-flex" />
          ) : null}

          <If condition={description}>
            <If condition={displaySidebarTrigger}>
              <Separator
                className="hidden h-4 w-px lg:group-data-[minimized]:block"
                orientation="vertical"
              />
            </If>

            <PageDescription>{description}</PageDescription>
          </If>
        </div>

        <If condition={title}>
          <PageTitle>{title}</PageTitle>
        </If>
      </div>

      {children}
    </div>
  );
}

function getSlotsFromPage(props: React.PropsWithChildren) {
  return React.Children.toArray(props.children).reduce<{
    Children: React.ReactElement | null;
    Navigation: React.ReactElement | null;
    MobileNavigation: React.ReactElement | null;
  }>(
    (acc, child) => {
      if (!React.isValidElement(child)) {
        return acc;
      }

      if (child.type === PageNavigation) {
        acc.Navigation = child;
        return acc;
      }

      if (child.type === PageMobileNavigation) {
        acc.MobileNavigation = child;
        return acc;
      }

      acc.Children = child;
      return acc;
    },
    {
      Children: null,
      Navigation: null,
      MobileNavigation: null,
    }
  );
}
