'use client';

import { UserTable } from './user-tables';
import { columns } from './user-tables/columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconUsers, IconUserCheck, IconUserX, IconShield } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { UserWithDetails } from '@/lib/services/users';

export default function UserListingPage() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-destructive">Failed to load users. Please try again.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const totalUsers = users.length;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <IconUserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <IconShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u: UserWithDetails) => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <IconUserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u: UserWithDetails) => u.role === 'MANAGER' || u.role === 'STAFF').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <UserTable
        data={users}
        totalItems={totalUsers}
        columns={columns}
      />
    </div>
  );
}
