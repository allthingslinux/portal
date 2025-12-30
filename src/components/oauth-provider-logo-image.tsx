import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { PROVIDER_LOGOS } from "~/lib/config/providers.config";

const DEFAULT_IMAGE_SIZE = 18;

export function OauthProviderLogoImage({
  providerId,
  width,
  height,
}: {
  providerId: string;
  width?: number;
  height?: number;
}) {
  const image = PROVIDER_LOGOS[providerId] ?? getDefaultLogos()[providerId];

  if (typeof image === "string") {
    return (
      <Image
        alt={`${providerId} logo`}
        decoding={"async"}
        height={height ?? DEFAULT_IMAGE_SIZE}
        loading={"lazy"}
        src={image}
        width={width ?? DEFAULT_IMAGE_SIZE}
      />
    );
  }

  return <>{image}</>;
}

function getDefaultLogos(): Record<string, React.ReactNode> {
  return {
    email: <Mail className="size-[18px]" />,
    phone: <Phone className="size-4" />,
    twitter: <XLogo />,
  };
}

function XLogo() {
  return (
    <svg
      height="16"
      version="1.1"
      viewBox="0 0 300 300"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>X logo</title>
      <path
        className={"fill-secondary-foreground"}
        d="M178.57 127.15 290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59h89.34M36.01 19.54H76.66l187.13 262.13h-40.66"
      />
    </svg>
  );
}
