'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProductVariant } from '@prisma/client';
import { TransformedProductVariant } from '@/lib/services';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const variantFormSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  material: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.string().min(1, 'Price is required'),
  comparePrice: z.string().optional(),
  costPrice: z.string().optional(),
  stock: z.string().min(1, 'Stock is required'),
  lowStockThreshold: z.string().min(1, 'Low stock threshold is required'),
  weight: z.string().optional(),
  isActive: z.boolean(),
});

type VariantFormValues = z.infer<typeof variantFormSchema>;

interface VariantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: TransformedProductVariant | null;
  productId: string;
  baseSku: string;
  onSave: (data: any) => Promise<void>;
  loading?: boolean;
}

// Common options
const COMMON_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  '28', '30', '32', '34', '36', '38', '40', '42',
  '6', '7', '8', '9', '10', '11', '12', '13',
  'One Size'
];

const COMMON_COLORS = [
  'Black', 'White', 'Gray', 'Navy', 'Blue', 'Red', 'Green', 'Yellow',
  'Orange', 'Purple', 'Pink', 'Brown', 'Beige', 'Khaki', 'Olive',
  'Maroon', 'Teal', 'Coral', 'Mint', 'Lavender'
];

const COMMON_MATERIALS = [
  'Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Leather',
  'Suede', 'Canvas', 'Fleece', 'Cashmere', 'Bamboo', 'Modal', 'Spandex'
];

export function VariantFormDialog({
  open,
  onOpenChange,
  variant,
  productId,
  baseSku,
  onSave,
  loading = false
}: VariantFormDialogProps) {
  const isEditing = !!variant;

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: {
      size: variant?.size || '',
      color: variant?.color || '',
      material: variant?.material || '',
      sku: variant?.sku || '',
      price: variant?.price ? variant.price.toString() : '',
      comparePrice: variant?.comparePrice ? variant.comparePrice.toString() : '',
      costPrice: variant?.costPrice ? variant.costPrice.toString() : '',
      stock: variant?.stock ? variant.stock.toString() : '0',
      lowStockThreshold: variant?.lowStockThreshold ? variant.lowStockThreshold.toString() : '5',
      weight: variant?.weight ? variant.weight.toString() : '',
      isActive: variant?.isActive ?? true,
    },
  });

  // Auto-generate SKU when size or color changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ((name === 'size' || name === 'color') && value.size && value.color && !isEditing) {
        const sizeCode = value.size.replace(/\s+/g, '').toUpperCase();
        const colorCode = value.color.replace(/\s+/g, '').toUpperCase().substring(0, 3);
        const generatedSku = `${baseSku}-${sizeCode}-${colorCode}`;
        form.setValue('sku', generatedSku);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, baseSku, isEditing]);

  const onSubmit = async (data: VariantFormValues) => {
    try {
      const formattedData = {
        productId,
        size: data.size,
        color: data.color,
        material: data.material || undefined,
        sku: data.sku,
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : undefined,
        costPrice: data.costPrice ? parseFloat(data.costPrice) : undefined,
        stock: parseInt(data.stock),
        lowStockThreshold: parseInt(data.lowStockThreshold),
        weight: data.weight ? parseFloat(data.weight) : undefined,
        isActive: data.isActive,
      };

      await onSave(formattedData);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error((error as Error).message || 'Failed to save variant');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Variant' : 'Add New Variant'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the variant details below.'
              : 'Create a new product variant with specific size, color, and pricing.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Basic Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMMON_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
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
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMMON_COLORS.map((color) => (
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="material"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMMON_MATERIALS.map((material) => (
                            <SelectItem key={material} value={material}>
                              {material}
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
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Auto-generated" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Pricing</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comparePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare Price</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Price</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Inventory */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Inventory</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" placeholder="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowStockThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Threshold *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" placeholder="5" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Enable this variant for sale
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (isEditing ? 'Update Variant' : 'Create Variant')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
