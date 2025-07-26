'use client'

import { AlertModal } from '@/components/modal/alert-modal'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UserWithDetails, canManageUser, hasPermission } from '@/lib/services/users'
import { UserRole } from '@prisma/client'
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconKey
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface CellActionProps {
  data: UserWithDetails
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const currentUserRole = session?.user?.role as UserRole
  const canEdit = hasPermission(currentUserRole, 'users', 'update')
  const canDelete = hasPermission(currentUserRole, 'users', 'delete') && canManageUser(currentUserRole, data.role)
  const canView = hasPermission(currentUserRole, 'users', 'read')

  const onConfirm = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/users/${data.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  const resetPassword = async () => {
    try {
      setLoading(true);
      const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // Generate random password

      const response = await fetch(`/api/users/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      toast.success(`Password reset successfully. New password: ${newPassword}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const isCurrentUser = session?.user?.id === data.id

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        title="Delete User"
        description={`Are you sure you want to delete user ${data.firstName} ${data.lastName}? This action cannot be undone.`}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {canView && (
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/users/${data.id}`)}
            >
              <IconEye className='mr-2 h-4 w-4' />
              View Details
            </DropdownMenuItem>
          )}

          {canEdit && (
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/users/${data.id}/edit`)}
            >
              <IconEdit className='mr-2 h-4 w-4' />
              Edit User
            </DropdownMenuItem>
          )}

          {canEdit && !isCurrentUser && (
            <DropdownMenuItem
              onClick={resetPassword}
              disabled={loading}
            >
              <IconKey className='mr-2 h-4 w-4' />
              Reset Password
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {canDelete && !isCurrentUser && (
            <DropdownMenuItem
              onClick={() => setOpen(true)}
              className="text-red-600 focus:text-red-600"
            >
              <IconTrash className='mr-2 h-4 w-4' />
              Delete User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
