"use client";

import { usePathname } from "next/navigation";
import { cn, isRouteActive } from "~/components/lib/utils";
import { Collapsible } from "~/components/ui/collapsible";
import type { Cms } from "~/features/cms/core";

export function DocsNavigationCollapsible(
  props: React.PropsWithChildren<{
    node: Cms.ContentItem;
    prefix: string;
  }>
) {
  const currentPath = usePathname();
  const prefix = props.prefix;

  const isChildActive = props.node.children.some((child: Cms.ContentItem) =>
    isRouteActive(`${prefix}/${child.url}`, currentPath, false)
  );

  return (
    <Collapsible
      className={cn("group/collapsible", {
        "group/active": isChildActive,
      })}
      defaultOpen={isChildActive ? true : !props.node.collapsed}
    >
      {props.children}
    </Collapsible>
  );
}
