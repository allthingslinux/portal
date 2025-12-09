import Image from "next/image";
import Link from "next/link";
import { cn } from "~/components/lib/utils";

function LogoImage({ className }: { className?: string }) {
  return (
    <Image
      alt="Logo"
      className={cn("w-[100px] object-contain", className)}
      height={100}
      src="/images/logo.png"
      width={100}
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
    <Link aria-label={label ?? "Home Page"} href={href ?? "/"} prefetch={true}>
      <LogoImage className={className} />
    </Link>
  );
}
