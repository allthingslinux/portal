import Link from 'next/link';
import Image from 'next/image';
import { cn } from '~/components/lib/utils';

function LogoImage({
  className,
}: {
  className?: string;
}) {
  return (
    <Image
      src="/images/logo.png"
      alt="Logo"
      width={100}
      height={100}
      className={cn('w-[100px] object-contain', className)}
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
