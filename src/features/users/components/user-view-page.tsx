'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import UserForm from './user-form';
import { toast } from 'sonner';

type TUserViewPageProps = {
  userId: string;
};

export default function UserViewPage({
  userId
}: TUserViewPageProps) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pageTitle = userId === 'new' ? 'Create New Admin User' : 'Edit Admin User';

  useEffect(() => {
    async function fetchUser() {
      if (userId === 'new') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError(true);
            toast.error('User not found');
            return;
          }
          throw new Error(`Failed to fetch user: ${response.status}`);
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(true);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  if (error) {
    notFound();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <UserForm initialData={user} pageTitle={pageTitle} />;
}
