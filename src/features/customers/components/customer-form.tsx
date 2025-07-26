'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useSession } from 'next-auth/react';

const customerFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  isVerified: z.boolean().optional().default(false)
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  initialData?: any;
  pageTitle: string;
}

export default function CustomerForm({ initialData, pageTitle }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const defaultValues: Partial<CustomerFormValues> = {
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    isVerified: initialData?.isVerified ?? false
  };

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues
  });

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      setLoading(true);

      if (!session?.user?.id) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      const url = initialData
        ? `/api/customers/${initialData.id}`
        : '/api/customers';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      toast.success(initialData ? 'Customer updated successfully' : 'Customer created successfully');

      router.push('/dashboard/customers');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex-1 space-y-4 pb-20'>
      <div className='flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
        <Button variant='ghost' size='sm' asChild className='w-fit'>
          <Link href='/dashboard/customers'>
            <IconArrowLeft className='h-4 w-4 mr-2' />
            Back to Customers
          </Link>
        </Button>
        <h1 className='text-xl sm:text-2xl font-bold'>{pageTitle}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
          <CardDescription>
            Create or update customer information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Customer name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='email@example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder='Optional phone number' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder='Optional address' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/dashboard/customers')}
                  disabled={loading}
                  className='w-full sm:w-auto'
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={loading} className='w-full sm:w-auto'>
                  {loading && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {initialData ? 'Update' : 'Create'} Customer
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

