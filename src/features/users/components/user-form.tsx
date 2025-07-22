'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2, IconMail, IconCalendar, IconShield } from '@tabler/icons-react';
import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FileUploader } from '@/components/file-uploader';
import { 
  ROLE_DISPLAY_NAMES, 
  getRoleColor, 
  formatUserName, 
  getAvailableRoles,
  hasPermission,
  UserWithDetails 
} from '@/lib/services/users';
import { UserRole } from '@prisma/client';

const userFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF']),
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
  const isEdit = !!initialData;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      password: '',
      role: initialData?.role || 'STAFF',
      imageUrl: initialData?.imageUrl || ''
    }
  });

  // Get available roles based on current user's role
  const availableRoles = session?.user?.role ? getAvailableRoles(session.user.role as UserRole) : [];
  const canManageRoles = hasPermission(session?.user?.role as UserRole, 'users', 'update');

  const onSubmit = async (data: UserFormValues) => {
    try {
      setLoading(true);

      if (!session?.user?.id) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      // Remove empty password for updates
      const formData = {
        ...data,
        imageUrl: data.imageUrl || undefined,
        password: data.password || undefined,
      };

      const url = initialData ? `/api/users/${initialData.id}` : '/api/users';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      toast.success(initialData ? 'User updated successfully!' : 'User created successfully!');
      router.push('/dashboard/users');
      router.refresh();

    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mx-auto w-full max-w-4xl pb-32 mb-16 min-h-screen'>
      {/* User Information Card (for edit mode) */}
      {initialData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <IconShield className='h-5 w-5' />
              <span>User Information</span>
            </CardTitle>
            <CardDescription>
              Current user details and account information.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div className='flex items-center space-x-3'>
                <IconMail className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>Email</p>
                  <p className='text-sm text-muted-foreground'>{initialData.email}</p>
                </div>
              </div>
              
              <div className='flex items-center space-x-3'>
                <IconShield className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>Current Role</p>
                  <Badge className={getRoleColor(initialData.role)}>
                    {ROLE_DISPLAY_NAMES[initialData.role as keyof typeof ROLE_DISPLAY_NAMES]}
                  </Badge>
                </div>
              </div>
              
              <div className='flex items-center space-x-3'>
                <IconCalendar className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>Member Since</p>
                  <p className='text-sm text-muted-foreground'>
                    {new Date(initialData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium mb-1'>Full Name</p>
                <p className='text-sm text-muted-foreground'>
                  {formatUserName(initialData.firstName, initialData.lastName)}
                </p>
              </div>
              
              <div>
                <p className='text-sm font-medium mb-1'>Last Updated</p>
                <p className='text-sm text-muted-foreground'>
                  {new Date(initialData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Form */}
      <Card>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>
            {pageTitle}
          </CardTitle>
          <CardDescription>
            {isEdit ? 'Update user information and permissions.' : 'Create a new user account with appropriate role and permissions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Basic Information</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
                          disabled={isEdit && !canManageRoles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Security & Role */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Security & Permissions</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type='password' 
                            placeholder={isEdit ? 'Enter new password' : 'Enter password'} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='role'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!canManageRoles}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select a role' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {ROLE_DISPLAY_NAMES[role as keyof typeof ROLE_DISPLAY_NAMES]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Profile Image */}
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>Profile Image</h3>
                <FormField
                  control={form.control}
                  name='imageUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image</FormLabel>
                      <FormControl>
                        <FileUploader
                          value={field.value}
                          onChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex justify-end space-x-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={loading}>
                  {loading && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {isEdit ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
