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
import { OrderWithDetails, PaymentStatus } from '@/lib/services'
import { 
  IconDotsVertical, 
  IconEye, 
  IconEdit, 
  IconTruck, 
  IconCheck,
  IconX,
  IconRefresh,
  IconPrinter
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface CellActionProps {
  data: OrderWithDetails
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const onConfirm = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/orders/${data.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel order');
      }

      toast.success('Order cancelled successfully');
      router.refresh();
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  const handleStatusUpdate = async (status: string) => {
    try {
      setLoading(true);

      const updateData: any = { status };

      // Add additional fields based on status
      if (status === 'SHIPPED') {
        updateData.shippingStatus = 'SHIPPED';
        updateData.shippedAt = new Date().toISOString();
      } else if (status === 'DELIVERED') {
        updateData.shippingStatus = 'DELIVERED';
        updateData.deliveredAt = new Date().toISOString();
      }

      const response = await fetch(`/api/orders/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order');
      }

      toast.success(`Order ${status.toLowerCase()} successfully`);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const canCancel = data.status === 'PENDING' || data.status === 'PROCESSING'
  const canShip = data.status === 'PROCESSING' && (data.paymentStatus as PaymentStatus) === 'PAID'
  const canComplete = data.status === 'SHIPPED'

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
        title="Cancel Order"
        description={`Are you sure you want to cancel order ${data.orderNumber}? This action cannot be undone.`}
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
            onClick={() => router.push(`/dashboard/orders/${data.id}`)}
          >
            <IconEye className='mr-2 h-4 w-4' />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/orders/${data.id}/edit`)}
          >
            <IconEdit className='mr-2 h-4 w-4' />
            Edit Order
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => window.print()}
          >
            <IconPrinter className='mr-2 h-4 w-4' />
            Print Invoice
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {data.status === 'PENDING' && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate('PROCESSING')}
            >
              <IconRefresh className='mr-2 h-4 w-4' />
              Start Processing
            </DropdownMenuItem>
          )}

          {canShip && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate('SHIPPED')}
            >
              <IconTruck className='mr-2 h-4 w-4' />
              Mark as Shipped
            </DropdownMenuItem>
          )}

          {canComplete && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate('DELIVERED')}
            >
              <IconCheck className='mr-2 h-4 w-4' />
              Mark as Delivered
            </DropdownMenuItem>
          )}

          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setOpen(true)}
                className="text-red-600 focus:text-red-600"
              >
                <IconX className='mr-2 h-4 w-4' />
                Cancel Order
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
