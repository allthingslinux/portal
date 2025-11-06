import Image from 'next/image';

import { cn } from '~/components/lib/utils';

type Props = {
  title: string;
  src: string;
  preloadImage?: boolean;
  className?: string;
};

export function CoverImage({ title, src, preloadImage, className }: Props) {
  return (
    <Image
      className={cn('block rounded-md object-cover', {
        className,
      })}
      src={src}
      priority={preloadImage}
      alt={`Cover Image for ${title}`}
      fill
    />
  );
}
