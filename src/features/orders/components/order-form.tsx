'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Order, OrderStatus, PaymentStatus, ShippingStatus } from '@prisma/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconArrowLeft } from '@tabler/icons-react'

const formSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  shippingStatus: z.nativeEnum(ShippingStatus),
  trackingNumber: z.string().nullable().optional(),
  adminNotes: z.string().nullable().optional(),
})

interface OrderFormProps {
  initialData: Order | null;
  pageTitle: string;
}

export function OrderForm({ initialData, pageTitle }: OrderFormProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      shippingStatus: ShippingStatus.PENDING,
      trackingNumber: '',
      adminNotes: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = initialData ? `/api/orders/${initialData.id}` : '/api/orders'
      const method = initialData ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Something went wrong')
      }

      toast.success(initialData ? 'Order updated.' : 'Order created.')
      router.push('/dashboard/orders')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong.')
    }
  }

  return (
    <div className='flex-1 space-y-4 pb-20'>
      <div className='flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
        <Button variant='ghost' size='sm' asChild className='w-fit'>
          <Link href='/dashboard/orders'>
            <IconArrowLeft className='h-4 w-4 mr-2' />
            Back to Orders
          </Link>
        </Button>
        <h1 className='text-xl sm:text-2xl font-bold'>{pageTitle}</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(OrderStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="paymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(PaymentStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shippingStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ShippingStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackingNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tracking Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tracking number" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="adminNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admin Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter admin notes" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  )
}