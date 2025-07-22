'use client';

import * as React from 'react';
import { ProductVariant } from '@prisma/client';
import { toast } from 'sonner';
import { Plus, Package, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { VariantTable } from './variant-table';
import { VariantFormDialog } from './variant-form-dialog';
import { BulkVariantCreator } from './bulk-variant-creator';

interface VariantManagerProps {
  productId: string;
  baseSku: string;
  initialVariants?: ProductVariant[];
}

export function VariantManager({ productId, baseSku, initialVariants = [] }: VariantManagerProps) {
  const [variants, setVariants] = React.useState<ProductVariant[]>(initialVariants);
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState<any>(null);
  
  // Dialog states
  const [variantFormOpen, setVariantFormOpen] = React.useState(false);
  const [bulkCreatorOpen, setBulkCreatorOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  
  // Current variant being edited/deleted
  const [currentVariant, setCurrentVariant] = React.useState<ProductVariant | null>(null);

  // Load variants and stats
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/variants`);
      if (!response.ok) {
        throw new Error('Failed to fetch variants');
      }
      const variantsData = await response.json();
      setVariants(variantsData);

      // Calculate stats from variants data
      const totalStock = variantsData.reduce((sum: number, v: ProductVariant) => sum + v.stock, 0);
      const totalValue = variantsData.reduce((sum: number, v: ProductVariant) => sum + (v.stock * Number(v.price)), 0);
      const lowStockCount = variantsData.filter((v: ProductVariant) => v.stock <= v.lowStockThreshold).length;
      const outOfStockCount = variantsData.filter((v: ProductVariant) => v.stock === 0).length;
      const activeCount = variantsData.filter((v: ProductVariant) => v.isActive).length;

      setStats({
        totalVariants: variantsData.length,
        activeVariants: activeCount,
        totalStock,
        totalValue,
        lowStockCount,
        outOfStockCount,
        averagePrice: variantsData.length > 0 ? variantsData.reduce((sum: number, v: ProductVariant) => sum + Number(v.price), 0) / variantsData.length : 0
      });
    } catch (error) {
      toast.error('Failed to load variant data');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle variant creation/update
  const handleVariantSave = async (data: any) => {
    try {
      setLoading(true);
      if (currentVariant) {
        const response = await fetch(`/api/products/${productId}/variants/${currentVariant.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update variant');
        }
        toast.success('Variant updated successfully');
      } else {
        const response = await fetch(`/api/products/${productId}/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create variant');
        }
        toast.success('Variant created successfully');
      }
      await loadData();
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk variant creation
  const handleBulkCreate = async (data: any) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create variants');
      }
      toast.success(`${data.selectedCombinations.length} variants created successfully`);
      await loadData();
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setLoading(false);
    }
  };

  // Handle variant deletion
  const handleVariantDelete = async () => {
    if (!currentVariant) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/variants/${currentVariant.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete variant');
      }
      toast.success('Variant deleted successfully');
      await loadData();
      setDeleteDialogOpen(false);
      setCurrentVariant(null);
    } catch (error) {
      toast.error('Failed to delete variant');
    } finally {
      setLoading(false);
    }
  };

  // Handle stock update
  const handleStockUpdate = async (variantId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/variants/${variantId}/stock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newStock }),
      });
      if (!response.ok) {
        throw new Error('Failed to update stock');
      }
      toast.success('Stock updated successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  // Handle variant duplication
  const handleVariantDuplicate = async (variant: ProductVariant) => {
    try {
      setLoading(true);
      // Create a new variant based on the existing one
      const duplicateData = {
        productId,
        size: `${variant.size} Copy`,
        color: variant.color,
        material: variant.material,
        sku: `${variant.sku}-COPY`,
        price: Number(variant.price),
        comparePrice: variant.comparePrice ? Number(variant.comparePrice) : undefined,
        costPrice: variant.costPrice ? Number(variant.costPrice) : undefined,
        stock: variant.stock,
        lowStockThreshold: variant.lowStockThreshold,
        weight: variant.weight ? Number(variant.weight) : undefined,
        isActive: variant.isActive
      };

      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to duplicate variant');
      }

      toast.success('Variant duplicated successfully');
      await loadData();
    } catch (error) {
      toast.error('Failed to duplicate variant');
    } finally {
      setLoading(false);
    }
  };

  // Dialog handlers
  const openVariantForm = (variant?: ProductVariant) => {
    setCurrentVariant(variant || null);
    setVariantFormOpen(true);
  };

  const openDeleteDialog = (variant: ProductVariant) => {
    setCurrentVariant(variant);
    setDeleteDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Variants</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVariants}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeVariants} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStock}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(stats.totalValue)} value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.outOfStockCount} out of stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averagePrice)}</div>
              <p className="text-xs text-muted-foreground">
                per variant
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Variants</CardTitle>
              <CardDescription>
                Manage size, color, and pricing variations for this product
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setBulkCreatorOpen(true)}
                disabled={loading}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Bulk Create</span>
                <span className="sm:hidden">Bulk</span>
              </Button>
              <Button
                onClick={() => openVariantForm()}
                disabled={loading}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Variant</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VariantTable
            variants={variants}
            onEdit={openVariantForm}
            onDelete={openDeleteDialog}
            onDuplicate={handleVariantDuplicate}
            onStockUpdate={handleStockUpdate}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <VariantFormDialog
        open={variantFormOpen}
        onOpenChange={setVariantFormOpen}
        variant={currentVariant}
        productId={productId}
        baseSku={baseSku}
        onSave={handleVariantSave}
        loading={loading}
      />

      <BulkVariantCreator
        open={bulkCreatorOpen}
        onOpenChange={setBulkCreatorOpen}
        productId={productId}
        baseSku={baseSku}
        onSave={handleBulkCreate}
        loading={loading}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the variant "{currentVariant?.size} / {currentVariant?.color}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVariantDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
