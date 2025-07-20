
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
      action={{
        label: "Create New Order",
        href: "/dashboard/orders/new"
      }}
    />
  )
}
