'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import type { OrderWithDetails } from '@/lib/services';

const orderFormSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  paymentStatus: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED']),
  shippingStatus: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED']),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  initialData?: OrderWithDetails | null;
}

export function OrderForm({ initialData }: OrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? `Edit Order #${initialData.orderNumber}` : 'Create New Order';
  const description = initialData ? 'Update order status and details' : 'Create a new order manually';
  const toastMessage = initialData ? 'Order updated successfully!' : 'Order created successfully!';
  const action = initialData ? 'Save Changes' : 'Create Order';

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: initialData ? {
      status: initialData.status,
      paymentStatus: initialData.paymentStatus,
      shippingStatus: initialData.shippingStatus,
      trackingNumber: initialData.trackingNumber || '',
      notes: initialData.adminNotes || '',
    } : {
      status: 'PENDING',
      paymentStatus: 'PENDING',
      shippingStatus: 'PENDING',
      trackingNumber: '',
      notes: '',
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    try {
      setLoading(true);
      
      if (!initialData) {
        toast.error('Order creation is not yet implemented');
        return;
      }
      
      const response = await fetch(`/api/orders/${initialData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      toast.success(toastMessage);
      router.push('/dashboard/orders');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto w-full max-w-4xl pb-20'>
      <Card>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>
            {title}
          </CardTitle>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </CardHeader>
        <CardContent>
          {!initialData ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Manual Order Creation Coming Soon</h3>
              <p className="text-muted-foreground mb-4">
                Manual order creation is currently under development. 
                Orders are typically created through the customer-facing store.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  In the meantime, you can:
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/dashboard/orders">
                      View Existing Orders
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard/products">
                      Manage Products
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select order status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='PENDING'>Pending</SelectItem>
                            <SelectItem value='CONFIRMED'>Confirmed</SelectItem>
                            <SelectItem value='PROCESSING'>Processing</SelectItem>
                            <SelectItem value='SHIPPED'>Shipped</SelectItem>
                            <SelectItem value='DELIVERED'>Delivered</SelectItem>
                            <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                            <SelectItem value='REFUNDED'>Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='paymentStatus'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select payment status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='PENDING'>Pending</SelectItem>
                            <SelectItem value='PROCESSING'>Processing</SelectItem>
                            <SelectItem value='COMPLETED'>Completed</SelectItem>
                            <SelectItem value='FAILED'>Failed</SelectItem>
                            <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                            <SelectItem value='REFUNDED'>Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='shippingStatus'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select shipping status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='PENDING'>Pending</SelectItem>
                            <SelectItem value='PROCESSING'>Processing</SelectItem>
                            <SelectItem value='SHIPPED'>Shipped</SelectItem>
                            <SelectItem value='IN_TRANSIT'>In Transit</SelectItem>
                            <SelectItem value='DELIVERED'>Delivered</SelectItem>
                            <SelectItem value='RETURNED'>Returned</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='trackingNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tracking Number</FormLabel>
                        <FormControl>
                          <Input placeholder='Enter tracking number' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='Add internal notes about this order...'
                          className='resize-none'
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-end space-x-2'>
                  <Button variant='outline' asChild>
                    <Link href='/dashboard/orders'>Cancel</Link>
                  </Button>
                  <Button type='submit' disabled={loading}>
                    {loading && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                    {action}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
