import { useState } from "react";
import { cn } from "~/components/lib/utils";
import logoUrl from "../assets/logo.png";

export function AppLogo({
  href,
  className,
}: {
  href?: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  const LogoImage = (
    <div className={cn("flex items-center gap-3", className)}>
      {!hasError && (
        // biome-ignore lint/performance/noImgElement: Keycloak theme does not use Next.js Image
        // biome-ignore lint: onError is valid on img and we provide alt text
        <img
          alt="Portal Logo"
          className="h-24 w-24 object-contain"
          height={48}
          onError={() => setHasError(true)}
          src={logoUrl}
          width={48}
        />
      )}
      {hasError && (
        <span className="font-bold text-4xl tracking-tighter">portal</span>
      )}
    </div>
  );

  if (!href) {
    return <div className={className}>{LogoImage}</div>;
  }

  return (
    <a className={className} href={href}>
      {LogoImage}
    </a>
  );
}
