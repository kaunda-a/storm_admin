import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'Sign In | Mzansi Footwear Admin',
  description: 'Sign in to your Mzansi Footwear admin account.'
};

export default async function Page() {
  return <SignInViewPage />;
}
