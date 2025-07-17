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
import { UserWithDetails } from '@/lib/services'
import { 
  IconDotsVertical, 
  IconEye, 
  IconEdit, 
  IconTrash,
  IconShield,
  IconMail,
  IconMapPin
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface CellActionProps {
  data: UserWithDetails
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const onConfirm = async () => {
    // Handle user deletion
  }

  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(data.role)

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        title="Delete User"
        description={`Are you sure you want to delete ${data.firstName} ${data.lastName}? This action cannot be undone.`}
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
          
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/users/${data.id}`)}
          >
            <IconEye className='mr-2 h-4 w-4' />
            View Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/users/${data.id}/edit`)}
          >
            <IconEdit className='mr-2 h-4 w-4' />
            Edit User
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/users/${data.id}/addresses`)}
          >
            <IconMapPin className='mr-2 h-4 w-4' />
            Manage Addresses
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => window.open(`mailto:${data.email}`, '_blank')}
          >
            <IconMail className='mr-2 h-4 w-4' />
            Send Email
          </DropdownMenuItem>

          {!isAdmin && (
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/users/${data.id}/permissions`)}
            >
              <IconShield className='mr-2 h-4 w-4' />
              Manage Permissions
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <IconTrash className='mr-2 h-4 w-4' />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
