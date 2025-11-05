import { AuthLayoutShell } from '@portal/auth/shared';

import { AppLogo } from '~/components/app-logo';

function AuthLayout({ children }: React.PropsWithChildren) {
  return <AuthLayoutShell Logo={AppLogo}>{children}</AuthLayoutShell>;
}

export default AuthLayout;
