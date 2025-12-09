import { AppLogo } from "~/components/app-logo";
import { AuthLayoutShell } from "~/features/auth/shared";

function AuthLayout({ children }: React.PropsWithChildren) {
  return <AuthLayoutShell Logo={AppLogo}>{children}</AuthLayoutShell>;
}

export default AuthLayout;
