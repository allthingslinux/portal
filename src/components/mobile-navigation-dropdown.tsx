"use client";

import { ChevronDown } from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Trans } from "./trans";

function MobileNavigationDropdown({
  links,
}: {
  links: {
    path: string;
    label: string;
  }[];
}) {
  const path = usePathname();

  const currentPathName = useMemo(
    () => Object.values(links).find((link) => link.path === path)?.label,
    [links, path]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={"w-full"} variant={"secondary"}>
          <span
            className={"flex w-full items-center justify-between space-x-2"}
          >
            <span>
              <Trans defaults={currentPathName} i18nKey={currentPathName} />
            </span>

            <ChevronDown className={"h-5"} />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={
          "w-screen divide-y divide-gray-100 dark:divide-dark-700" +
          "rounded-none"
        }
      >
        {Object.values(links).map((link) => (
          <DropdownMenuItem asChild key={link.path}>
            <Link className={"flex h-12 w-full items-center"} href={link.path}>
              <Trans defaults={link.label} i18nKey={link.label} />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MobileNavigationDropdown;
