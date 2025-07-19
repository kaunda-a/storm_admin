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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import * as z from 'zod';

const marqueeFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ALERT', 'PROMOTION', 'SYSTEM', 'INVENTORY']),
  priority: z.number().min(1).max(5),
  isActive: z.boolean(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

type MarqueeFormValues = z.infer<typeof marqueeFormSchema>;

interface MarqueeFormProps {
  initialData?: any;
  pageTitle: string;
}

const marqueeTypes = [
  { value: 'INFO', label: 'Info' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'ERROR', label: 'Error' },
  { value: 'ALERT', label: 'Alert' },
  { value: 'PROMOTION', label: 'Promotion' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'INVENTORY', label: 'Inventory' }
];

export default function MarqueeForm({ initialData, pageTitle }: MarqueeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const defaultValues: Partial<MarqueeFormValues> = {
    title: initialData?.title || '',
    message: initialData?.message || '',
    type: initialData?.type || 'INFO',
    priority: initialData?.priority || 1,
    isActive: initialData?.isActive ?? true,
    imageUrl: initialData?.imageUrl || '',
    linkUrl: initialData?.linkUrl || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : ''
  };

  const form = useForm<MarqueeFormValues>({
    resolver: zodResolver(marqueeFormSchema),
    defaultValues
  });

  const onSubmit = async (data: MarqueeFormValues) => {
    try {
      setLoading(true);

      if (!session?.user?.id) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      const formattedData = {
        ...data,
        imageUrl: data.imageUrl || undefined,
        linkUrl: data.linkUrl || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      };

      const url = initialData ? `/api/marquee/${initialData.id}` : '/api/marquee';
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

      toast.success(initialData ? 'Marquee message updated successfully' : 'Marquee message created successfully');
      router.push('/dashboard/marquee');
      router.refresh();
    } catch (error: any) {
      console.error('Error submitting marquee form:', error);
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex-1 space-y-4'>
      <div className='flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
        <Button variant='ghost' size='sm' asChild className='w-fit'>
          <Link href='/dashboard/marquee'>
            <IconArrowLeft className='h-4 w-4 mr-2' />
            Back to Marquee
          </Link>
        </Button>
        <h1 className='text-xl sm:text-2xl font-bold'>{pageTitle}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marquee Message Details</CardTitle>
          <CardDescription>
            Create or edit marquee messages that will be displayed to users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter marquee title' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select message type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {marqueeTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='message'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter marquee message'
                        className='min-h-[100px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority (1-5)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select priority' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='1'>1 - Low</SelectItem>
                          <SelectItem value='2'>2 - Normal</SelectItem>
                          <SelectItem value='3'>3 - Medium</SelectItem>
                          <SelectItem value='4'>4 - High</SelectItem>
                          <SelectItem value='5'>5 - Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='imageUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com/image.jpg' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='linkUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com/link' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='startDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='endDate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Active Status</FormLabel>
                      <div className='text-sm text-muted-foreground'>
                        Enable this marquee message to be displayed to users
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/dashboard/marquee')}
                  disabled={loading}
                  className='w-full sm:w-auto'
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={loading} className='w-full sm:w-auto'>
                  {loading && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {initialData ? 'Update' : 'Create'} Marquee
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
