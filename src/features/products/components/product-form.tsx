'use client';

import { BulkImageUploader } from '@/components/bulk-image-uploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VariantManager } from './variants/variant-manager';
import { InventoryManager } from './inventory/inventory-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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



const formSchema = z.object({
  images: z.array(z.object({
    id: z.string().optional(),
    url: z.string(),
    altText: z.string().optional(),
    sortOrder: z.number(),
    isPrimary: z.boolean(),
  })).optional(),
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

  // Debug: Log the initialData to see what we're getting
  useEffect(() => {
    console.log('ProductForm initialData:', initialData);
    console.log('Has ID:', !!initialData?.id);
    console.log('Variants count:', initialData?.variants?.length || 0);
  }, [initialData]);
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
    images: initialData?.images?.map((img, index) => ({
      id: img.id,
      url: img.url,
      altText: img.altText || '',
      sortOrder: (img as any).sortOrder || index,
      isPrimary: img.isPrimary || index === 0,
    })) || []
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
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
      toast.error('Failed to load categories and brands. Please refresh the page.');
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      // Transform form data for API
      const formData = {
        ...values,
        price: parseFloat(values.price),
        compareAtPrice: values.compareAtPrice ? parseFloat(values.compareAtPrice) : undefined,
        costPrice: values.costPrice ? parseFloat(values.costPrice) : undefined,
        quantity: values.quantity ? parseInt(values.quantity) : 0,
        lowStockThreshold: values.lowStockThreshold ? parseInt(values.lowStockThreshold) : undefined,
        weight: values.weight ? parseFloat(values.weight) : undefined,
        images: values.images?.map(img => ({
          url: img.url,
          altText: img.altText,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary
        })) || []
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
      router.push('/dashboard/product');
      router.refresh();

    } catch (error: any) {
      // Error already handled by toast.error below
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='mx-auto w-full max-w-6xl pb-32 mb-16 min-h-screen'>
      <Card>
        <CardHeader>
          <CardTitle className='text-left text-2xl font-bold'>
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className='max-h-none overflow-visible'>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
              <TabsTrigger value="details" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Product </span>Details
              </TabsTrigger>
              <TabsTrigger value="variants" disabled={!initialData} className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Variants </span>
                <span className="sm:hidden">Var </span>
                {initialData && `(${initialData.variants?.length || 0})`}
              </TabsTrigger>
              <TabsTrigger value="inventory" disabled={!initialData} className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Inventory</span>
                <span className="sm:hidden">Inv</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 overflow-visible'>
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <div className='space-y-6'>
                  <FormItem className='w-full'>
                    <FormLabel>Product Images</FormLabel>
                    <FormControl>
                      <BulkImageUploader
                        value={field.value}
                        onChange={field.onChange}
                        disabled={loading}
                        maxImages={10}
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
                      value={field.value}
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

                  <div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-8 pb-8'>
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
            </TabsContent>

            <TabsContent value="variants" className="space-y-6 mt-6">
              {initialData && initialData.id ? (
                <VariantManager
                  productId={initialData.id}
                  baseSku={initialData.sku}
                  initialVariants={initialData.variants || []}
                />
              ) : initialData ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Variants</CardTitle>
                    <CardDescription>
                      Loading product data...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Variants</CardTitle>
                    <CardDescription>
                      Save the product first to manage variants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Variants allow you to create different versions of this product with unique sizes, colors, and pricing.
                      Complete the product details and save to start adding variants.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6 mt-6">
              {initialData && initialData.id ? (
                <InventoryManager
                  productId={initialData.id}
                  productName={initialData.name || 'Product'}
                  initialVariants={initialData.variants || []}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>
                      {initialData ? 'Loading product data...' : 'Save the product first to manage inventory'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {initialData ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        Inventory management allows you to track stock levels, set low stock alerts, and manage inventory across all product variants.
                        Complete the product details and save to start managing inventory.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
