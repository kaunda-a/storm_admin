'use client'

import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header'
import { OrderWithDetails } from '@/lib/services'
import { Column, ColumnDef } from '@tanstack/react-table'
import { 
  IconPackage, 
  IconCreditCard, 
  IconTruck, 
  IconUser,
  IconCalendar,
  IconCurrencyDollar
} from '@tabler/icons-react'
import { CellAction } from './cell-action'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  PROCESSING: 'bg-blue-500/10 text-blue-600 border-blue-200',
  SHIPPED: 'bg-purple-500/10 text-purple-600 border-purple-200',
  DELIVERED: 'bg-green-500/10 text-green-600 border-green-200',
  CANCELLED: 'bg-red-500/10 text-red-600 border-red-200',
  REFUNDED: 'bg-gray-500/10 text-gray-600 border-gray-200'
}

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  PAID: 'bg-green-500/10 text-green-600 border-green-200',
  FAILED: 'bg-red-500/10 text-red-600 border-red-200',
  REFUNDED: 'bg-gray-500/10 text-gray-600 border-gray-200'
}

const shippingStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
  PROCESSING: 'bg-blue-500/10 text-blue-600 border-blue-200',
  SHIPPED: 'bg-purple-500/10 text-purple-600 border-purple-200',
  DELIVERED: 'bg-green-500/10 text-green-600 border-green-200',
  RETURNED: 'bg-orange-500/10 text-orange-600 border-orange-200'
}

export const columns: ColumnDef<OrderWithDetails>[] = [
  {
    id: 'orderNumber',
    accessorKey: 'orderNumber',
    header: ({ column }: { column: Column<OrderWithDetails, unknown> }) => (
      <DataTableColumnHeader column={column} title='Order #' />
    ),
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className='space-y-1'>
          <div className='font-medium'>{order.orderNumber}</div>
          <div className='text-sm text-muted-foreground flex items-center'>
            <IconCalendar className='w-3 h-3 mr-1' />
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
      )
    }
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className='space-y-1'>
          <div className='font-medium flex items-center'>
            <IconUser className='w-3 h-3 mr-1' />
            {order.customer.firstName} {order.customer.lastName}
          </div>
          <div className='text-sm text-muted-foreground'>
            {order.customer.email}
          </div>
        </div>
      )
    }
  },
  {
    id: 'items',
    header: 'Items',
    cell: ({ row }) => {
      const order = row.original
      const itemCount = order.items.length
      const firstItem = order.items[0]
      
      return (
        <div className='space-y-1'>
          <div className='font-medium flex items-center'>
            <IconPackage className='w-3 h-3 mr-1' />
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </div>
          {firstItem && (
            <div className='text-sm text-muted-foreground'>
              {firstItem.product.name}
              {itemCount > 1 && ` +${itemCount - 1} more`}
            </div>
          )}
        </div>
      )
    }
  },
  {
    id: 'total',
    header: ({ column }: { column: Column<OrderWithDetails, unknown> }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className='font-medium flex items-center'>
          <IconCurrencyDollar className='w-3 h-3 mr-1' />
          R{order.totalAmount.toFixed(2)}
        </div>
      )
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<OrderWithDetails, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const order = row.original
      return (
        <Badge className={statusColors[order.status] || 'bg-gray-500/10 text-gray-600 border-gray-200'}>
          {order.status.toLowerCase()}
        </Badge>
      )
    }
  },
  {
    id: 'paymentStatus',
    accessorKey: 'paymentStatus',
    header: 'Payment',
    cell: ({ row }) => {
      const order = row.original
      return (
        <Badge className={paymentStatusColors[order.paymentStatus] || 'bg-gray-500/10 text-gray-600 border-gray-200'}>
          <IconCreditCard className='w-3 h-3 mr-1' />
          {order.paymentStatus.toLowerCase()}
        </Badge>
      )
    }
  },
  {
    id: 'shippingStatus',
    accessorKey: 'shippingStatus',
    header: 'Shipping',
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className='space-y-1'>
          <Badge className={shippingStatusColors[order.shippingStatus] || 'bg-gray-500/10 text-gray-600 border-gray-200'}>
            <IconTruck className='w-3 h-3 mr-1' />
            {order.shippingStatus.toLowerCase()}
          </Badge>
          {order.trackingNumber && (
            <div className='text-xs text-muted-foreground'>
              #{order.trackingNumber}
            </div>
          )}
        </div>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]
