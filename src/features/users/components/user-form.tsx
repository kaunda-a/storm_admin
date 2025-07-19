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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import * as z from 'zod';
import { UserWithDetails } from '@/lib/services';

const userFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN', 'MANAGER']),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData: UserWithDetails | null;
  pageTitle: string;
}

export default function UserForm({ initialData, pageTitle }: UserFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const defaultValues: Partial<UserFormValues> = {
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    role: initialData?.role || 'USER',
    imageUrl: initialData?.imageUrl || ''
  };

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValues) => {
    try {
      setLoading(true);

      if (!session?.user?.id) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      const formattedData = {
        ...data,
        imageUrl: data.imageUrl || undefined,
      };

      const url = initialData ? `/api/users/${initialData.id}` : '/api/users';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      toast.success(initialData ? 'User updated successfully' : 'User created successfully');
      router.push('/dashboard/users');
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting user form:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex-1 space-y-4'>
      <div className='flex items-center justify-between'>
        <Button variant='outline' size='sm' asChild>
          <Link href='/dashboard/users'>
            <IconArrowLeft className='mr-2 h-4 w-4' />
            Back to Users
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <CardDescription>
            {initialData ? 'Update user information and permissions.' : 'Create a new user account with appropriate permissions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter first name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter last name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type='email' 
                        placeholder='Enter email address' 
                        {...field} 
                        disabled={!!initialData} // Disable email editing for existing users
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select user role' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='USER'>User</SelectItem>
                          <SelectItem value='MANAGER'>Manager</SelectItem>
                          <SelectItem value='ADMIN'>Admin</SelectItem>
                          <SelectItem value='SUPER_ADMIN'>Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='imageUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com/image.jpg' {...field} />
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
                  onClick={() => router.push('/dashboard/users')}
                  disabled={loading}
                  className='w-full sm:w-auto'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={loading}
                  className='w-full sm:w-auto'
                >
                  {loading && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {initialData ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
