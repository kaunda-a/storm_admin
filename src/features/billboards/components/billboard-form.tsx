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
  FormDescription,
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
import { FileUploader } from '@/components/file-uploader';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import * as z from 'zod';

const MAX_FILE_SIZE = 10000000; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const billboardFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  image: z
    .any()
    .optional()
    .refine((files) => !files || files?.length === 0 || files?.length >= 1, 'Invalid file selection.')
    .refine(
      (files) => !files || files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 10MB.`
    )
    .refine(
      (files) => !files || files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    ),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkText: z.string().optional(),
  type: z.enum(['PROMOTIONAL', 'ANNOUNCEMENT', 'PRODUCT_LAUNCH', 'SALE', 'SEASONAL', 'SYSTEM_MESSAGE', 'BRAND_CAMPAIGN']),
  position: z.enum(['HEADER', 'SIDEBAR', 'FOOTER', 'MODAL', 'DASHBOARD_TOP', 'DASHBOARD_BOTTOM', 'PRODUCT_PAGE', 'CHECKOUT']),
  isActive: z.boolean(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortOrder: z.number().min(0).max(999)
});

type BillboardFormValues = z.infer<typeof billboardFormSchema>;

interface BillboardFormProps {
  initialData?: any;
  pageTitle: string;
}

const billboardTypes = [
  { value: 'PROMOTIONAL', label: 'Promotional' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'PRODUCT_LAUNCH', label: 'Product Launch' },
  { value: 'SALE', label: 'Sale' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'SYSTEM_MESSAGE', label: 'System Message' },
  { value: 'BRAND_CAMPAIGN', label: 'Brand Campaign' }
];

const billboardPositions = [
  { value: 'HEADER', label: 'Header' },
  { value: 'SIDEBAR', label: 'Sidebar' },
  { value: 'FOOTER', label: 'Footer' },
  { value: 'MODAL', label: 'Modal' },
  { value: 'DASHBOARD_TOP', label: 'Dashboard Top' },
  { value: 'DASHBOARD_BOTTOM', label: 'Dashboard Bottom' },
  { value: 'PRODUCT_PAGE', label: 'Product Page' },
  { value: 'CHECKOUT', label: 'Checkout' }
];

export default function BillboardForm({ initialData, pageTitle }: BillboardFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const defaultValues: Partial<BillboardFormValues> = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    image: undefined,
    imageUrl: initialData?.imageUrl || '',
    videoUrl: initialData?.videoUrl || '',
    linkUrl: initialData?.linkUrl || '',
    linkText: initialData?.linkText || '',
    type: initialData?.type || 'PROMOTIONAL',
    position: initialData?.position || 'HEADER',
    isActive: initialData?.isActive ?? true,
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    sortOrder: initialData?.sortOrder || 0
  };

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(billboardFormSchema),
    defaultValues
  });

  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true);

      if (!session?.user?.id) {
        toast.error('You must be logged in to perform this action');
        return;
      }

      // Handle image upload first if there are any
      let finalImageUrl = data.imageUrl;
      if (data.image && data.image.length > 0) {
        // For now, we'll simulate image upload
        // In production, you would upload to Cloudinary or your preferred service
        toast.info('Image upload functionality will be implemented with Cloudinary integration');
        // Simulate uploaded URL
        finalImageUrl = `https://via.placeholder.com/800x400?text=${encodeURIComponent(data.title)}`;
      }

      const formattedData = {
        ...data,
        imageUrl: finalImageUrl || undefined,
        videoUrl: data.videoUrl || undefined,
        linkUrl: data.linkUrl || undefined,
        linkText: data.linkText || undefined,
        description: data.description || undefined,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      };

      const url = initialData ? `/api/billboards/${initialData.id}` : '/api/billboards';
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

      toast.success(initialData ? 'Billboard updated successfully' : 'Billboard created successfully');
      
      router.push('/dashboard/billboards');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex-1 space-y-4'>
      <div className='flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'>
        <Button variant='ghost' size='sm' asChild className='w-fit'>
          <Link href='/dashboard/billboards'>
            <IconArrowLeft className='h-4 w-4 mr-2' />
            Back to Billboards
          </Link>
        </Button>
        <h1 className='text-xl sm:text-2xl font-bold'>{pageTitle}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billboard Details</CardTitle>
          <CardDescription>
            Create or edit billboards that will be displayed across the application.
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
                        <Input placeholder='Enter billboard title' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='sortOrder'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input 
                          type='number' 
                          placeholder='0' 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter billboard description'
                        className='min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select billboard type' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {billboardTypes.map((type) => (
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

                <FormField
                  control={form.control}
                  name='position'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select position' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {billboardPositions.map((position) => (
                            <SelectItem key={position.value} value={position.value}>
                              {position.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Image Upload Section */}
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='image'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Image (Optional)</FormLabel>
                      <FormControl>
                        <FileUploader
                          value={field.value}
                          onValueChange={field.onChange}
                          maxFiles={1}
                          maxSize={10 * 1024 * 1024} // 10MB
                          accept={{
                            'image/jpeg': [],
                            'image/jpg': [],
                            'image/png': [],
                            'image/webp': []
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload an image file (JPG, PNG, WebP) up to 10MB. This will override the Image URL if both are provided.
                      </FormDescription>
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
                      <FormDescription>
                        Or provide an image URL instead of uploading a file.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='videoUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com/video.mp4' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='linkUrl'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='linkText'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Text (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder='Learn More' {...field} />
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
                        Enable this billboard to be displayed to users
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
                  onClick={() => router.push('/dashboard/billboards')}
                  disabled={loading}
                  className='w-full sm:w-auto'
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={loading} className='w-full sm:w-auto'>
                  {loading && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {initialData ? 'Update' : 'Create'} Billboard
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
