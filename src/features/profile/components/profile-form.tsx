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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2, IconUser, IconMail, IconCalendar, IconShield } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import * as z from 'zod';
import { ROLE_DISPLAY_NAMES, getRoleColor, formatUserName } from '@/lib/services/users';
import { FileUploader } from '@/components/file-uploader';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal(''))
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const router = useRouter();
  const { data: session } = useSession();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      imageUrl: ''
    }
  });

  // Load current profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        if (response.ok) {
          const profile = await response.json();
          setProfileData(profile);
          form.reset({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            imageUrl: profile.imageUrl || ''
          });
        }
      } catch (error) {
        toast.error('Failed to load profile data. Please refresh the page.');
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, [session, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);

      if (!session?.user?.id) {
        toast.error('You must be logged in to update your profile');
        return;
      }

      const formattedData = {
        ...data,
        imageUrl: data.imageUrl || undefined,
      };

      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      toast.success('Profile updated successfully');
      router.refresh();
    } catch (error: any) {
      // Error already handled by toast.error below
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <IconLoader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='flex-1 space-y-4'>
      {/* User Information Card */}
      {profileData && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <IconShield className='h-5 w-5' />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>
              Your account details and role information.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              <div className='flex items-center space-x-3'>
                <IconMail className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>Email</p>
                  <p className='text-sm text-muted-foreground'>{profileData.email}</p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <IconShield className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>Role</p>
                  <Badge className={getRoleColor(profileData.role)}>
                    {ROLE_DISPLAY_NAMES[profileData.role as keyof typeof ROLE_DISPLAY_NAMES]}
                  </Badge>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <IconCalendar className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium'>Member Since</p>
                  <p className='text-sm text-muted-foreground'>
                    {new Date(profileData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium mb-1'>Full Name</p>
                <p className='text-sm text-muted-foreground'>
                  {formatUserName(profileData.firstName, profileData.lastName)}
                </p>
              </div>

              <div>
                <p className='text-sm font-medium mb-1'>Last Updated</p>
                <p className='text-sm text-muted-foreground'>
                  {new Date(profileData.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <IconUser className='h-5 w-5' />
            <span>Edit Profile</span>
          </CardTitle>
          <CardDescription>
            Update your personal information and profile settings.
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
                        <Input placeholder='Enter your first name' {...field} />
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
                        <Input placeholder='Enter your last name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='imageUrl'
                render={({ field }) => (
                  <FormItem className='col-span-1 sm:col-span-2'>
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

              <div className='flex justify-end'>
                <Button
                  type='submit'
                  disabled={loading}
                  className='w-full sm:w-auto'
                >
                  {loading && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Update Profile
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
