'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header'
import { UserWithDetails } from '@/lib/services'
import { Column, ColumnDef } from '@tanstack/react-table'
import { 
  IconUser, 
  IconMail, 
  IconCalendar,
  IconShoppingBag,
  IconStar
} from '@tabler/icons-react'
import { CellAction } from './cell-action'

const roleColors = {
  CUSTOMER: 'bg-blue-500/10 text-blue-600 border-blue-200',
  STAFF: 'bg-green-500/10 text-green-600 border-green-200',
  MANAGER: 'bg-purple-500/10 text-purple-600 border-purple-200',
  ADMIN: 'bg-red-500/10 text-red-600 border-red-200',
  SUPER_ADMIN: 'bg-gray-500/10 text-gray-600 border-gray-200'
}

export const columns: ColumnDef<UserWithDetails>[] = [
  {
    id: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original
      const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
      
      return (
        <div className='flex items-center space-x-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={user.imageUrl || undefined} alt='Avatar' />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>
              {user.firstName} {user.lastName}
            </div>
            <div className='text-sm text-muted-foreground flex items-center'>
              <IconMail className='w-3 h-3 mr-1' />
              {user.email}
            </div>
          </div>
        </div>
      )
    }
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: ({ column }: { column: Column<UserWithDetails, unknown> }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <Badge className={roleColors[user.role]}>
          {user.role.replace('_', ' ').toLowerCase()}
        </Badge>
      )
    }
  },
  {
    id: 'activity',
    header: 'Activity',
    cell: ({ row }) => {
      const user = row.original
      
      return (
        <div className='space-y-1'>
          <div className='flex items-center space-x-2 text-sm'>
            <IconShoppingBag className='w-3 h-3 text-muted-foreground' />
            <span>{user._count.orders} orders</span>
          </div>
          <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
            <IconStar className='w-3 h-3' />
            <span>{user._count.reviews} reviews</span>
          </div>
        </div>
      )
    }
  },
  {
    id: 'addresses',
    header: 'Addresses',
    cell: ({ row }) => {
      const user = row.original
      const addressCount = user.addresses.length
      
      return (
        <div className='text-sm'>
          <span className='font-medium'>{addressCount}</span>
          <span className='text-muted-foreground ml-1'>
            address{addressCount !== 1 ? 'es' : ''}
          </span>
        </div>
      )
    }
  },
  {
    id: 'joinedAt',
    accessorKey: 'createdAt',
    header: ({ column }: { column: Column<UserWithDetails, unknown> }) => (
      <DataTableColumnHeader column={column} title='Joined' />
    ),
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className='flex items-center space-x-2 text-sm'>
          <IconCalendar className='w-3 h-3 text-muted-foreground' />
          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]
