'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/file-uploader';

const billboardTypes = [
  { value: 'PROMOTIONAL', label: 'Promotional' },
  { value: 'ANNOUNCEMENT', label: 'Announcement' },
  { value: 'PRODUCT_LAUNCH', label: 'Product Launch' },
  { value: 'SALE', label: 'Sale' },
  { value: 'SEASONAL', label: 'Seasonal' },
  { value: 'SYSTEM_MESSAGE', label: 'System Message' },
  { value: 'BRAND_CAMPAIGN', label: 'Brand Campaign' },
];

const billboardPositions = [
  { value: 'HEADER', label: 'Header' },
  { value: 'SIDEBAR', label: 'Sidebar' },
  { value: 'FOOTER', label: 'Footer' },
  { value: 'MODAL', label: 'Modal' },
  { value: 'DASHBOARD_TOP', label: 'Dashboard Top' },
  { value: 'DASHBOARD_BOTTOM', label: 'Dashboard Bottom' },
  { value: 'PRODUCT_PAGE', label: 'Product Page' },
  { value: 'CHECKOUT', label: 'Checkout' },
];

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  linkText: z.string().optional(),
  type: z.enum(['PROMOTIONAL', 'ANNOUNCEMENT', 'PRODUCT_LAUNCH', 'SALE', 'SEASONAL', 'SYSTEM_MESSAGE', 'BRAND_CAMPAIGN']).default('PROMOTIONAL'),
  position: z.enum(['HEADER', 'SIDEBAR', 'FOOTER', 'MODAL', 'DASHBOARD_TOP', 'DASHBOARD_BOTTOM', 'PRODUCT_PAGE', 'CHECKOUT']).default('HEADER'),
  isActive: z.boolean().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortOrder: z.number().min(0).default(0),
});

type BillboardFormValues = z.infer<typeof formSchema>;

interface BillboardFormProps {
  initialData?: any; // Billboard data from API
  pageTitle: string;
}

export default function BillboardForm({ initialData, pageTitle }: BillboardFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      imageUrl: initialData?.imageUrl || '',
      videoUrl: initialData?.videoUrl || '',
      linkUrl: initialData?.linkUrl || '',
      linkText: initialData?.linkText || '',
      type: initialData?.type || 'PROMOTIONAL',
      position: initialData?.position || 'HEADER',
      isActive: initialData?.isActive ?? true,
      startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
      sortOrder: initialData?.sortOrder || 0,
    },
  });

  const onSubmit = async (values: BillboardFormValues) => {
    try {
      setLoading(true);

      // Transform form data for API
      const formData = {
        ...values,
        imageUrl: values.imageUrl || undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        videoUrl: values.videoUrl || undefined,
        linkUrl: values.linkUrl || undefined,
        linkText: values.linkText || undefined,
        description: values.description || undefined,
      };

      const url = initialData ? `/api/billboards/${initialData.id}` : '/api/billboards';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save billboard');
      }

      toast.success(initialData ? 'Billboard updated successfully!' : 'Billboard created successfully!');
      router.refresh();
      router.push('/dashboard/billboards');
    } catch (error) {
      // Error already handled by toast.error below
      toast.error((error as Error).message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl pb-32 mb-16 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter billboard title" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter billboard description"
                        className="min-h-[100px]"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image (Optional)</FormLabel>
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

              {/* Video URL */}
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/video.mp4"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Link URL and Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="linkUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Text (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Learn More"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Type and Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select billboard type" />
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
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select billboard position" />
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

              {/* Start and End Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sort Order and Active Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable this billboard to be displayed
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? 'Saving...' : (initialData ? 'Update Billboard' : 'Create Billboard')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}



