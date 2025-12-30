import { OauthProviderLogoImage } from "~/components/oauth-provider-logo-image";
import { Button } from "~/components/ui/button";

export function AuthProviderButton({
  providerId,
  onClick,
  children,
}: React.PropsWithChildren<{
  providerId: string;
  onClick: () => void;
}>) {
  return (
    <Button
      className={"flex w-full gap-x-3 text-center"}
      data-provider={providerId}
      data-test={"auth-provider-button"}
      onClick={onClick}
      variant={"outline"}
    >
      <OauthProviderLogoImage providerId={providerId} />

      <span>{children}</span>
    </Button>
  );
}
