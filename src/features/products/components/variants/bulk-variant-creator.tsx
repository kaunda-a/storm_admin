'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const bulkVariantSchema = z.object({
  sizes: z.array(z.string()).min(1, 'Select at least one size'),
  colors: z.array(z.string()).min(1, 'Select at least one color'),
  basePrice: z.string().min(1, 'Base price is required'),
  baseStock: z.string().min(1, 'Base stock is required'),
  baseLowStockThreshold: z.string().min(1, 'Low stock threshold is required'),
});

type BulkVariantFormValues = z.infer<typeof bulkVariantSchema>;

interface BulkVariantCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function BulkVariantCreator({
  open,
  onOpenChange,
  productId,
  baseSku,
  onSave,
  loading = false
}: BulkVariantCreatorProps) {
  const [selectedCombinations, setSelectedCombinations] = React.useState<
    { size: string; color: string }[]
  >([]);

  const form = useForm<BulkVariantFormValues>({
    resolver: zodResolver(bulkVariantSchema),
    defaultValues: {
      sizes: [],
      colors: [],
      basePrice: '',
      baseStock: '10',
      baseLowStockThreshold: '5',
    },
  });

  const watchedSizes = form.watch('sizes');
  const watchedColors = form.watch('colors');

  // Update combinations when sizes or colors change
  React.useEffect(() => {
    const combinations: { size: string; color: string }[] = [];
    
    watchedSizes.forEach(size => {
      watchedColors.forEach(color => {
        combinations.push({ size, color });
      });
    });
    
    setSelectedCombinations(combinations);
  }, [watchedSizes, watchedColors]);

  const generateSKU = (size: string, color: string) => {
    const sizeCode = size.replace(/\s+/g, '').toUpperCase();
    const colorCode = color.replace(/\s+/g, '').toUpperCase().substring(0, 3);
    return `${baseSku}-${sizeCode}-${colorCode}`;
  };

  const onSubmit = async (data: BulkVariantFormValues) => {
    try {
      const matrixData = {
        productId,
        baseSku,
        sizes: data.sizes,
        colors: data.colors,
        selectedCombinations,
        basePrice: parseFloat(data.basePrice),
        baseStock: parseInt(data.baseStock),
        baseLowStockThreshold: parseInt(data.baseLowStockThreshold),
      };

      await onSave(matrixData);
      onOpenChange(false);
      form.reset();
      setSelectedCombinations([]);
    } catch (error) {
      toast.error((error as Error).message || 'Failed to create variants');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSelectedCombinations([]);
  };

  const removeCombination = (sizeToRemove: string, colorToRemove: string) => {
    setSelectedCombinations(prev => 
      prev.filter(combo => !(combo.size === sizeToRemove && combo.color === colorToRemove))
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Create Variants</DialogTitle>
          <DialogDescription>
            Create multiple variants at once by selecting size and color combinations.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Size Selection */}
            <FormField
              control={form.control}
              name="sizes"
              render={() => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Sizes</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {COMMON_SIZES.map((size) => (
                      <FormField
                        key={size}
                        control={form.control}
                        name="sizes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={size}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(size)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, size])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== size
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {size}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Color Selection */}
            <FormField
              control={form.control}
              name="colors"
              render={() => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Colors</FormLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {COMMON_COLORS.map((color) => (
                      <FormField
                        key={color}
                        control={form.control}
                        name="colors"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={color}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(color)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, color])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== color
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {color}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Base Values */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Base Values (Applied to All Variants)</h4>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="0.00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Stock *</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" placeholder="10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="baseLowStockThreshold"
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
              </div>
            </div>

            {/* Preview */}
            {selectedCombinations.length > 0 && (
              <>
                <Separator />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Preview ({selectedCombinations.length} variants will be created)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {selectedCombinations.map((combo, index) => (
                        <div
                          key={`${combo.size}-${combo.color}`}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{combo.size}</Badge>
                            <Badge variant="outline">{combo.color}</Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              {generateSKU(combo.size, combo.color)}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCombination(combo.size, combo.color)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || selectedCombinations.length === 0}
              >
                {loading ? 'Creating...' : `Create ${selectedCombinations.length} Variants`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
