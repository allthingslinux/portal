import Link from 'next/link';

import { cn } from '~/components/lib/utils';

function LogoImage({
  className,
}: {
  className?: string;
}) {
  return (
    <img
      src="/images/logo.png"
      alt="Logo"
      className={cn('w-[80px] lg:w-[95px] object-contain', className)}
    />
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'} prefetch={true}>
      <LogoImage className={className} />
    </Link>
  );
}
