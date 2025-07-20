
'use client'

import { EmptyState } from '@/components/ui/empty-state'
import { IconPackage } from '@tabler/icons-react'
import Link from 'next/link'

export function OrdersEmptyState() {
  return (
    <EmptyState
      icon={IconPackage}
      title="No orders found"
      description="There are no orders to display. You can create a new order by clicking the button below."
      action={
        <Button size='sm' className='relative' asChild>
          <Link href="/dashboard/orders/new">
            Create New Order
          </Link>
        </Button>
      }
    />
  )
}
