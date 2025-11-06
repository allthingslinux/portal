'use client';

import { useEffect, useEffectEvent, useMemo, useState } from 'react';

import { usePathname } from 'next/navigation';

import { Menu } from 'lucide-react';

import { isBrowser } from '~/shared/utils';
import { Button } from '~/components/ui/button';
import { If } from '~/components/makerkit/if';

export function FloatingDocumentationNavigation(
  props: React.PropsWithChildren,
) {
  const activePath = usePathname();

  const body = useMemo(() => {
    return isBrowser() ? document.body : null;
  }, []);

  const [isVisible, setIsVisible] = useState(false);

  const enableScrolling = useEffectEvent(
    () => body && (body.style.overflowY = ''),
  );

  const disableScrolling = useEffectEvent(
    () => body && (body.style.overflowY = 'hidden'),
  );

  // enable/disable body scrolling when the docs are toggled
  useEffect(() => {
    if (isVisible) {
      disableScrolling();
    } else {
      enableScrolling();
    }
  }, [isVisible]);

  // hide docs when navigating to another page
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
            'fixed top-0 left-0 z-10 h-screen w-full p-4' +
            ' dark:bg-background flex flex-col space-y-4 overflow-auto bg-white'
          }
        >
          {props.children}
        </div>
      </If>

      <Button
        className={'fixed right-5 bottom-5 z-10 h-16 w-16 rounded-full'}
        onClick={onClick}
      >
        <Menu className={'h-8'} />
      </Button>
    </>
  );
}
