'use client'

import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header'
import { UserWithDetails, formatUserName, getUserInitials, getRoleColor, ROLE_DISPLAY_NAMES } from '@/lib/services/users'
import { Column, ColumnDef } from '@tanstack/react-table'
import {
  IconCalendar,
  IconShield,
  IconMail
} from '@tabler/icons-react'
import { CellAction } from './cell-action'

export const columns: ColumnDef<UserWithDetails>[] = [
  {
    id: 'user',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original
      const fullName = formatUserName(user.firstName, user.lastName)
      const initials = getUserInitials(user.firstName, user.lastName)

      return (
        <div className='flex items-center space-x-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={user.imageUrl || ''} alt={fullName} />
            <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>{fullName}</div>
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
      const role = user.role as keyof typeof ROLE_DISPLAY_NAMES

      return (
        <Badge className={getRoleColor(role)}>
          <IconShield className='w-3 h-3 mr-1' />
          {ROLE_DISPLAY_NAMES[role]}
        </Badge>
      )
    }
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }: { column: Column<UserWithDetails, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created' />
    ),
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className='text-sm flex items-center'>
          <IconCalendar className='w-3 h-3 mr-1' />
          {new Date(user.createdAt).toLocaleDateString()}
        </div>
      )
    }
  },
  {
    id: 'activity',
    header: 'Activity',
    cell: ({ row }) => {
      const user = row.original
      const count = user._count

      return (
        <div className='text-sm'>
          <div>{count?.billboards || 0} billboards</div>
          <div className='text-muted-foreground'>{count?.marqueeMessages || 0} messages</div>
        </div>
      )
    }
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]
