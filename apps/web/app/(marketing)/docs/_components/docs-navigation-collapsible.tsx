'use client';

import { usePathname } from 'next/navigation';

import { Cms } from '@portal/cms';
import { Collapsible } from '@portal/ui/collapsible';
import { cn, isRouteActive } from '@portal/ui/utils';

export function DocsNavigationCollapsible(
  props: React.PropsWithChildren<{
    node: Cms.ContentItem;
    prefix: string;
  }>,
) {
  const currentPath = usePathname();
  const prefix = props.prefix;

  const isChildActive = props.node.children.some((child) =>
    isRouteActive(prefix + '/' + child.url, currentPath, false),
  );

  return (
    <Collapsible
      className={cn('group/collapsible', {
        'group/active': isChildActive,
      })}
      defaultOpen={isChildActive ? true : !props.node.collapsed}
    >
      {props.children}
    </Collapsible>
  );
}
