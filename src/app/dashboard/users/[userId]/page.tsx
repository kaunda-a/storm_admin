import { UserViewPage } from '@/features/users/components/user-view-page';

export default async function Page({
  params
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <UserViewPage userId={userId} />;
}
