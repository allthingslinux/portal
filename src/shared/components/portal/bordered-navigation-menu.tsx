"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";
import { cn, isRouteActive } from "../lib/utils";
import { Trans } from "./trans";

export function BorderedNavigationMenu(props: React.PropsWithChildren) {
  return (
    <NavigationMenu>
      <NavigationMenuList className={"relative h-full space-x-2"}>
        {props.children}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function BorderedNavigationMenuItem(props: {
  path: string;
  label: React.ReactNode | string;
  end?: boolean | ((path: string) => boolean);
  active?: boolean;
  className?: string;
  buttonClassName?: string;
}) {
  const pathname = usePathname();

  const active = props.active ?? isRouteActive(props.path, pathname, props.end);

  return (
    <NavigationMenuItem className={props.className}>
      <Button
        asChild
        className={cn("relative active:shadow-xs", props.buttonClassName)}
        variant={"ghost"}
      >
        <Link
          className={cn("text-sm", {
            "text-secondary-foreground": active,
            "text-secondary-foreground/80 hover:text-secondary-foreground":
              !active,
          })}
          href={props.path}
        >
          {typeof props.label === "string" ? (
            <Trans defaults={props.label} i18nKey={props.label} />
          ) : (
            props.label
          )}

          {active ? (
            <span
              className={cn(
                "fade-in zoom-in-90 absolute -bottom-2.5 left-0 h-0.5 w-full animate-in bg-primary"
              )}
            />
          ) : null}
        </Link>
      </Button>
    </NavigationMenuItem>
  );
}
