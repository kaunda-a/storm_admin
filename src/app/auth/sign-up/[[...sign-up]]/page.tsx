import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';

export const metadata: Metadata = {
  title: 'Sign Up | Mzansi Footwear Admin',
  description: 'Create your Mzansi Footwear admin account.'
};

export default async function Page() {
  return <SignUpViewPage />;
}
