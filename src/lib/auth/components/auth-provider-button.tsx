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
  console.log("🔧 AuthProviderButton rendered for:", providerId);
  
  return (
    <Button
      className={"flex w-full gap-x-3 text-center"}
      data-provider={providerId}
      data-test={"auth-provider-button"}
      onClick={(e) => {
        console.log("🔥 BUTTON CLICKED - RAW EVENT:", e);
        console.log("🔥 Provider ID:", providerId);
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      variant={"outline"}
    >
      <OauthProviderLogoImage providerId={providerId} />

      <span>{children}</span>
    </Button>
  );
}
