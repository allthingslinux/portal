import React from 'react';

import { Button } from '~/components/ui/button';
import { cn } from '~/components/lib/utils';

import { CtaButton } from './cta-button';
import { GradientSecondaryText } from './gradient-secondary-text';
import { HeroTitle } from './hero-title';

const ComingSoonHeading: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => <HeroTitle className={cn(className)} {...props} />;

ComingSoonHeading.displayName = 'ComingSoonHeading';

const ComingSoonText: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => (
  <GradientSecondaryText
    className={cn('text-muted-foreground text-lg md:text-xl', className)}
    {...props}
  />
);
ComingSoonText.displayName = 'ComingSoonText';

const ComingSoonButton: React.FC<
  React.ComponentPropsWithoutRef<typeof Button>
> = ({ className, ...props }) => (
  <CtaButton className={cn('mt-8', className)} {...props} />
);
ComingSoonButton.displayName = 'ComingSoonButton';

const ComingSoon: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  const childrenArray = React.Children.toArray(children);

  const logo = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === ComingSoonLogo,
  );

  const heading = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === ComingSoonHeading,
  );

  const text = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === ComingSoonText,
  );

  const button = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === ComingSoonButton,
  );

  const cmps = [
    ComingSoonHeading,
    ComingSoonText,
    ComingSoonButton,
    ComingSoonLogo,
  ];

  const otherChildren = childrenArray.filter(
    (child) =>
      React.isValidElement(child) &&
      !cmps.includes(child.type as (typeof cmps)[number]),
  );

  return (
    <div
      className={cn(
        'container flex min-h-screen flex-col items-center justify-center space-y-12 p-4',
        className,
      )}
      {...props}
    >
      {logo}

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center space-y-8 text-center">
        {heading}

        <div className={'mx-auto max-w-2xl'}>{text}</div>

        {button}

        {otherChildren}
      </div>
    </div>
  );
};
ComingSoon.displayName = 'ComingSoon';

const ComingSoonLogo: React.FC<React.HTMLAttributes<HTMLImageElement>> = ({
  className,
  ...props
}) => <div className={cn(className, 'fixed top-8 left-8')} {...props} />;
ComingSoonLogo.displayName = 'ComingSoonLogo';

export {
  ComingSoon,
  ComingSoonHeading,
  ComingSoonText,
  ComingSoonButton,
  ComingSoonLogo,
};
