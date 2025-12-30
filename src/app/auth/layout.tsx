import { AppLogo } from "~/components/app-logo";
import { AuthLayoutShell } from "~/lib/auth/components/auth-layout";

function AuthLayout({ children }: React.PropsWithChildren) {
  return <AuthLayoutShell Logo={AppLogo}>{children}</AuthLayoutShell>;
}

export default AuthLayout;
