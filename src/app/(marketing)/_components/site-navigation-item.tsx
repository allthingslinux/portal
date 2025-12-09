"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, isRouteActive } from "~/components/lib/utils";
import { NavigationMenuItem } from "~/components/ui/navigation-menu";

const getClassName = (path: string, currentPathName: string) => {
  const isActive = isRouteActive(path, currentPathName);

  return cn(
    "inline-flex w-max font-medium text-sm transition-colors duration-300",
    {
      "dark:text-gray-300 dark:hover:text-white": !isActive,
      "text-current dark:text-white": isActive,
    }
  );
};

export function SiteNavigationItem({
  path,
  children,
}: React.PropsWithChildren<{
  path: string;
}>) {
  const currentPathName = usePathname();
  const className = getClassName(path, currentPathName);

  return (
    <NavigationMenuItem key={path}>
      <Link as={path} className={className} href={path} prefetch={true}>
        {children}
      </Link>
    </NavigationMenuItem>
  );
}
