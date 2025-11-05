'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavigationMenuItem } from '@portal/ui/navigation-menu';
import { cn, isRouteActive } from '@portal/ui/utils';

const getClassName = (path: string, currentPathName: string) => {
  const isActive = isRouteActive(path, currentPathName);

  return cn(
    `inline-flex w-max text-sm font-medium transition-colors duration-300`,
    {
      'dark:text-gray-300 dark:hover:text-white': !isActive,
      'text-current dark:text-white': isActive,
    },
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
      <Link className={className} href={path} as={path} prefetch={true}>
        {children}
      </Link>
    </NavigationMenuItem>
  );
}
