import { Metadata } from 'next';
import SignInViewPage from '../_components/sigin-view';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function LoginPage() {
  // const session = await auth();

  // if (session?.user) {
  //   redirect('/overview');
  // }

  return (
    <div>
      <SignInViewPage />;
    </div>
  );
}
