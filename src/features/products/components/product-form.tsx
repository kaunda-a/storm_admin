'use client';

import { FileUploader } from '@/components/file-uploader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryFormDialog } from '@/components/forms/category-form-dialog';
import { BrandFormDialog } from '@/components/forms/brand-form-dialog';
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

import { Textarea } from '@/components/ui/textarea';
import { ProductWithDetails } from '@/lib/services';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { IconPlus } from '@tabler/icons-react';

const MAX_FILE_SIZE = 10000000; // 10MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const formSchema = z.object({
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
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.'
  }),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().min(1, 'Brand is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.'
  }),
  price: z.string().min(1, 'Price is required'),
  compareAtPrice: z.string().optional(),
  costPrice: z.string().optional(),
  quantity: z.string().optional(),
  lowStockThreshold: z.string().optional(),
  weight: z.string().optional(),
  trackQuantity: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false)
});

export default function ProductForm({
  initialData,
  pageTitle
}: {
  initialData: ProductWithDetails | null;
  pageTitle: string;
}) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const router = useRouter();
  const defaultValues = {
    name: initialData?.name || '',
    categoryId: initialData?.category?.id || '',
    brandId: initialData?.brand?.id || '',
    sku: initialData?.sku || '',
    description: initialData?.description || '',
    price: initialData?.variants?.[0]?.price?.toString() || '',
    compareAtPrice: initialData?.variants?.[0]?.comparePrice?.toString() || '',
    costPrice: initialData?.variants?.[0]?.costPrice?.toString() || '',
    quantity: initialData?.variants?.[0]?.stock?.toString() || '',
    lowStockThreshold: initialData?.variants?.[0]?.lowStockThreshold?.toString() || '',
    weight: initialData?.variants?.[0]?.weight?.toString() || '',
    trackQuantity: false,
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    image: undefined
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: defaultValues
  });

  // Load categories and brands on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/brands')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData);
      }
    } catch (error) {
      console.error('Error loading categories and brands:', error);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      // Handle image uploads first if there are any
      let imageUrls: string[] = [];
      if (values.image && values.image.length > 0) {
        // For now, we'll simulate image upload
        // In production, you would upload to Cloudinary or your preferred service
        toast.info('Image upload functionality will be implemented with Cloudinary integration');
        // Simulate uploaded URLs
        imageUrls = values.image.map((_: any, index: number) =>
          `https://via.placeholder.com/400x400?text=Product+Image+${index + 1}`
        );
      }

      // Transform form data for API
      const formData = {
        ...values,
        price: parseFloat(values.price),
        compareAtPrice: values.compareAtPrice ? parseFloat(values.compareAtPrice) : undefined,
        costPrice: values.costPrice ? parseFloat(values.costPrice) : undefined,
        quantity: values.quantity ? parseInt(values.quantity) : 0,
        lowStockThreshold: values.lowStockThreshold ? parseInt(values.lowStockThreshold) : undefined,
        weight: values.weight ? parseFloat(values.weight) : undefined,
        images: imageUrls
      };

      const url = initialData ? `/api/products/${initialData.id}` : '/api/products';
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

      toast.success(initialData ? 'Product updated successfully!' : 'Product created successfully!');
      router.push('/dashboard/products');
      router.refresh();

    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='mx-auto w-full max-w-4xl pb-20'>
      <Card>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <div className='space-y-6'>
                  <FormItem className='w-full'>
                    <FormLabel>Images</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={field.value}
                        onValueChange={field.onChange}
                        maxFiles={4}
                        maxSize={10 * 1024 * 1024} // 10MB
                        accept={{
                          'image/jpeg': [],
                          'image/jpg': [],
                          'image/png': [],
                          'image/webp': []
                        }}
                        // disabled={loading}
                        // progresses={progresses}
                        // pass the onUpload function here for direct upload
                        // onUpload={uploadFiles}
                        // disabled={isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              )}
            />

            <div className='grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter product name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='categoryId'
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Category</FormLabel>
                      <CategoryFormDialog
                        onSuccess={loadData}
                        trigger={
                          <Button type="button" variant="outline" size="sm">
                            <IconPlus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        }
                      />
                    </div>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value[field.value.length - 1]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select categories' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
                name='sku'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Product SKU (e.g., NIKE-AM90-001)'
                        {...field}
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter product description'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add Brand field after category */}
            <FormField
              control={form.control}
              name='brandId'
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Brand</FormLabel>
                    <BrandFormDialog
                      onSuccess={loadData}
                      trigger={
                        <Button type="button" variant="outline" size="sm">
                          <IconPlus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      }
                    />
                  </div>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select brand' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing and Inventory Fields */}
            <div className='grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3'>
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (ZAR)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='compareAtPrice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compare At Price (ZAR)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='costPrice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price (ZAR)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Inventory Fields */}
            <div className='grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3'>
              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='0'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lowStockThreshold'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Stock Threshold</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='5'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='weight'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4'>
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                    <FormControl>
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={field.onChange}
                        className='h-4 w-4'
                      />
                    </FormControl>
                    <FormLabel>Active</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='isFeatured'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                    <FormControl>
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={field.onChange}
                        className='h-4 w-4'
                      />
                    </FormControl>
                    <FormLabel>Featured</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='trackQuantity'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                    <FormControl>
                      <input
                        type='checkbox'
                        checked={field.value}
                        onChange={field.onChange}
                        className='h-4 w-4'
                      />
                    </FormControl>
                    <FormLabel>Track Quantity</FormLabel>
                  </FormItem>
                )}
              />
            </div>

              <div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-6'>
                <Button
                  type='submit'
                  disabled={loading}
                  className='w-full sm:w-auto'
                >
                  {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Add Product')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
