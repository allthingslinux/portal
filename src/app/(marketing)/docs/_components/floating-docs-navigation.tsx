"use client";

import { Menu } from "lucide-react";

import { usePathname } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { If } from "~/components/if";
import { Button } from "~/components/ui/button";
import { isBrowser } from "~/utils/utils";

export function FloatingDocumentationNavigation(
  props: React.PropsWithChildren
) {
  const activePath = usePathname();

  const body = useMemo(() => (isBrowser() ? document.body : null), []);

  const [isVisible, setIsVisible] = useState(false);

  const enableScrolling = useEffectEvent(() => {
    if (body) {
      body.style.overflowY = "";
    }
  });

  const disableScrolling = useEffectEvent(() => {
    if (body) {
      body.style.overflowY = "hidden";
    }
  });

  // enable/disable body scrolling when the docs are toggled
  // biome-ignore lint/correctness/useExhaustiveDependencies: handlers are stable via useEffectEvent
  useEffect(() => {
    if (isVisible) {
      disableScrolling();
    } else {
      enableScrolling();
    }
  }, [disableScrolling, enableScrolling, isVisible]);

  // hide docs when navigating to another page
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset is independent of handler identity
  useEffect(() => {
    setIsVisible(false);
  }, [activePath]);

  const onClick = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <If condition={isVisible}>
        <div
          className={
            "fixed top-0 left-0 z-10 h-screen w-full p-4" +
            "flex flex-col space-y-4 overflow-auto bg-white dark:bg-background"
          }
        >
          {props.children}
        </div>
      </If>

      <Button
        className={"fixed right-5 bottom-5 z-10 h-16 w-16 rounded-full"}
        onClick={onClick}
      >
        <Menu className={"h-8"} />
      </Button>
    </>
  );
}
