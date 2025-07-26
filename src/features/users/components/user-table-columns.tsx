'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IconDots, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { formatUserName, getUserInitials, getRoleColor, ROLE_DISPLAY_NAMES } from '@/lib/services/users';
import { UserWithDetails } from '@/lib/services/users';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

export const columns: ColumnDef<UserWithDetails>[] = [
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original;
      const fullName = formatUserName(user.firstName, user.lastName);
      const initials = getUserInitials(user.firstName, user.lastName);

      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.imageUrl || ''} alt={fullName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as keyof typeof ROLE_DISPLAY_NAMES;
      return (
        <Badge className={getRoleColor(role)}>
          {ROLE_DISPLAY_NAMES[role]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="text-sm">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: '_count',
    header: 'Activity',
    cell: ({ row }) => {
      const count = row.original._count;
      return (
        <div className="text-sm">
          <div>{count?.billboards || 0} billboards</div>
          <div className="text-muted-foreground">{count?.marqueeMessages || 0} messages</div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: ({ row }) => {
      const user = row.original;
      const router = useRouter();
      const [loading, setLoading] = useState(false);

      const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        setLoading(true);
        try {
          const response = await fetch(`/api/users/${user.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete user');
          }

          toast.success('User deleted successfully');
          router.refresh();
        } catch (error: any) {
          toast.error(error.message || 'Failed to delete user');
        } finally {
          setLoading(false);
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <IconDots className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/users/${user.id}`)}
            >
              <IconEye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}
            >
              <IconEdit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={loading}
              className="text-red-600 focus:text-red-600"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
