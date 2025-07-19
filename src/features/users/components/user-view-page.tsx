import { notFound } from 'next/navigation';
import UserForm from './user-form';
import { UserWithDetails } from '@/lib/services';

type TUserViewPageProps = {
  userId: string;
};

async function getUser(id: string): Promise<UserWithDetails | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/users/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch user: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function UserViewPage({
  userId
}: TUserViewPageProps) {
  let user = null;
  let pageTitle = 'Create New User';

  if (userId !== 'new') {
    user = await getUser(userId);
    if (!user) {
      notFound();
    }
    pageTitle = `Edit User: ${user.firstName} ${user.lastName}`;
  }

  return <UserForm initialData={user} pageTitle={pageTitle} />;
}
