import { Menu } from "lucide-react";
import Link from "next/link";
import { Trans } from "~/components/trans";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";

import { SiteNavigationItem } from "./site-navigation-item";

const links = {
  Blog: {
    label: "marketing:blog",
    path: "/blog",
  },
  Changelog: {
    label: "marketing:changelog",
    path: "/changelog",
  },
  Docs: {
    label: "marketing:documentation",
    path: "/docs",
  },
  FAQ: {
    label: "marketing:faq",
    path: "/faq",
  },
};

export function SiteNavigation() {
  const NavItems = Object.values(links).map((item) => (
    <SiteNavigationItem key={item.path} path={item.path}>
      <Trans i18nKey={item.label} />
    </SiteNavigationItem>
  ));

  return (
    <>
      <div className={"hidden items-center justify-center md:flex"}>
        <NavigationMenu>
          <NavigationMenuList className={"gap-x-2.5"}>
            {NavItems}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className={"flex justify-start sm:items-center md:hidden"}>
        <MobileDropdown />
      </div>
    </>
  );
}

function MobileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={"Open Menu"}>
        <Menu className={"h-8 w-8"} />
      </DropdownMenuTrigger>

      <DropdownMenuContent className={"w-full"}>
        {Object.values(links).map((item) => {
          const className = "flex w-full h-full items-center";

          return (
            <DropdownMenuItem asChild key={item.path}>
              <Link className={className} href={item.path}>
                <Trans i18nKey={item.label} />
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
