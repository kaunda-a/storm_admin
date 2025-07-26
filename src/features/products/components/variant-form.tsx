'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
// Type for product variants - using local definition since ProductVariant isn't exported from Prisma
type ProductVariant = {
  id: string
  productId: string
  size: string
  color: string
  material?: string
  sku: string
  price: number
  compareAtPrice?: number | null
  costPrice?: number | null
  stock: number
  lowStockThreshold: number
  weight?: number | null
  isActive: boolean

  isDefault?: boolean
  createdAt: Date
  updatedAt: Date
}
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const variantFormSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.string().min(1, 'Price is required'),
  compareAtPrice: z.string().optional(),
  stock: z.string().min(1, 'Stock quantity is required'),
  lowStockThreshold: z.string().min(1, 'Low stock threshold is required'),
  weight: z.string().optional(),
  isActive: z.boolean().default(true),

  isDefault: z.boolean().default(false)
})

type VariantFormValues = z.infer<typeof variantFormSchema>

interface VariantFormProps {
  productId: string
  variant?: ProductVariant
  onSubmit: (data: VariantFormValues) => Promise<void>
}

// Common shoe sizes for South African market
const SHOE_SIZES = [
  '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', 
  '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13', '14'
]

// Common colors for footwear
const COLORS = [
  'Black', 'White', 'Brown', 'Tan', 'Navy', 'Grey', 'Red', 'Blue', 
  'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Beige', 'Khaki'
]

export function VariantForm({ productId, variant, onSubmit }: VariantFormProps) {
  const router = useRouter()
  const isEditing = !!variant

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      size: variant?.size || '',
      color: variant?.color || '',
      sku: variant?.sku || '',
      price: variant?.price?.toString() || '',
      compareAtPrice: variant?.compareAtPrice?.toString() || '',
      stock: variant?.stock.toString() || '0',
      lowStockThreshold: variant?.lowStockThreshold.toString() || '5',
      weight: variant?.weight?.toString() || '',
      isActive: variant?.isActive ?? true,

      isDefault: variant?.isDefault ?? false
    }
  })

  const handleSubmit = async (data: VariantFormValues) => {
    try {
      await onSubmit(data)
      router.push(`/dashboard/product/${productId}/variants`)
    } catch (error) {
      toast.error('Failed to save variant. Please try again.')
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center space-x-4'>
        <Button variant='ghost' size='sm' asChild>
          <Link href={`/dashboard/product/${productId}/variants`}>
            <IconArrowLeft className='h-4 w-4 mr-2' />
            Back to Variants
          </Link>
        </Button>
        <div>
          <h1 className='text-2xl font-bold'>
            {isEditing ? 'Edit Variant' : 'Create New Variant'}
          </h1>
          <p className='text-muted-foreground'>
            {isEditing ? 'Update variant details' : 'Add a new size/color variant for this product'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Variant Details</CardTitle>
              <CardDescription>
                Configure the size, color, and identification for this variant
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='size'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select size' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SHOE_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              Size {size}
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
                  name='color'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select color' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
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
                name='sku'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., NIKE-AM90-BLK-9' {...field} />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for this variant
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Set the price and compare-at price for this variant
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (ZAR)</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' placeholder='0.00' {...field} />
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
                      <FormLabel>Compare at Price (ZAR)</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' placeholder='0.00' {...field} />
                      </FormControl>
                      <FormDescription>
                        Original price to show discount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>
                Manage stock levels and inventory tracking
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='stock'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type='number' min='0' placeholder='0' {...field} />
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
                        <Input type='number' min='0' placeholder='5' {...field} />
                      </FormControl>
                      <FormDescription>
                        Alert when stock falls below this level
                      </FormDescription>
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
                        <Input type='number' step='0.01' placeholder='0.5' {...field} />
                      </FormControl>
                      <FormDescription>
                        For shipping calculations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Configure variant availability and default settings
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Active</FormLabel>
                      <FormDescription>
                        Make this variant available for purchase
                      </FormDescription>
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


              <FormField
                control={form.control}
                name='isDefault'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Default Variant</FormLabel>
                      <FormDescription>
                        Show this variant by default on product pages
                      </FormDescription>
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
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className='flex items-center justify-end space-x-2'>
            <Button variant='outline' asChild>
              <Link href={`/dashboard/products/${productId}/variants`}>
                Cancel
              </Link>
            </Button>
            <Button type='submit'>
              <IconDeviceFloppy className='h-4 w-4 mr-2' />
              {isEditing ? 'Update Variant' : 'Create Variant'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
