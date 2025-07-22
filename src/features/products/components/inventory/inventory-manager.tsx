'use client';

import * as React from 'react';
import { ProductVariant } from '@prisma/client';
import { toast } from 'sonner';
import { Package, TrendingDown, TrendingUp, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InventoryManagerProps {
  productId: string;
  productName: string;
  initialVariants?: ProductVariant[];
}

interface InventoryStats {
  totalStock: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  averagePrice: number;
  totalVariants: number;
}

interface StockAdjustment {
  variantId: string;
  adjustment: number;
  reason: string;
}

export function InventoryManager({ productId, productName, initialVariants = [] }: InventoryManagerProps) {
  const [variants, setVariants] = React.useState<ProductVariant[]>(initialVariants);
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState<InventoryStats | null>(null);
  const [bulkAdjustmentOpen, setBulkAdjustmentOpen] = React.useState(false);
  const [bulkAdjustment, setBulkAdjustment] = React.useState('');
  const [adjustmentReason, setAdjustmentReason] = React.useState('');

  // Load variants and calculate stats
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/variants`);
      if (!response.ok) {
        throw new Error('Failed to fetch variants');
      }
      const variantsData = await response.json();
      setVariants(variantsData);
      
      // Calculate stats
      const totalStock = variantsData.reduce((sum: number, v: ProductVariant) => sum + v.stock, 0);
      const totalValue = variantsData.reduce((sum: number, v: ProductVariant) => sum + (v.stock * Number(v.price)), 0);
      const lowStockCount = variantsData.filter((v: ProductVariant) => v.stock <= v.lowStockThreshold && v.stock > 0).length;
      const outOfStockCount = variantsData.filter((v: ProductVariant) => v.stock === 0).length;
      const averagePrice = variantsData.length > 0 ? variantsData.reduce((sum: number, v: ProductVariant) => sum + Number(v.price), 0) / variantsData.length : 0;
      
      setStats({
        totalStock,
        totalValue,
        lowStockCount,
        outOfStockCount,
        averagePrice,
        totalVariants: variantsData.length
      });
    } catch (error) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [loadData, productId]);

  // Update individual variant stock
  const updateVariantStock = async (variantId: string, newStock: number) => {
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

  // Bulk stock adjustment
  const handleBulkAdjustment = async () => {
    if (!bulkAdjustment || !adjustmentReason) {
      toast.error('Please enter adjustment amount and reason');
      return;
    }

    const adjustment = parseInt(bulkAdjustment);
    if (isNaN(adjustment)) {
      toast.error('Please enter a valid number');
      return;
    }

    try {
      setLoading(true);
      const promises = variants.map(variant =>
        fetch(`/api/products/${productId}/variants/${variant.id}/stock`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adjustment }),
        })
      );

      await Promise.all(promises);
      toast.success(`Bulk adjustment of ${adjustment > 0 ? '+' : ''}${adjustment} applied to all variants`);
      await loadData();
      setBulkAdjustmentOpen(false);
      setBulkAdjustment('');
      setAdjustmentReason('');
    } catch (error) {
      toast.error('Failed to apply bulk adjustment');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (variant: ProductVariant) => {
    if (variant.stock === 0) return 'out';
    if (variant.stock <= variant.lowStockThreshold) return 'low';
    return 'good';
  };

  const getStockBadge = (variant: ProductVariant) => {
    const status = getStockStatus(variant);
    
    switch (status) {
      case 'out':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'low':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
      default:
        return <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!productId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Save the product first to manage inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Inventory management allows you to track stock levels, set low stock alerts, and manage inventory across all product variants.
            Complete the product details and save to start managing inventory.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inventory Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStock}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalVariants} variants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Inventory worth
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
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</div>
              <p className="text-xs text-muted-foreground">
                Urgent restock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averagePrice)}</div>
              <p className="text-xs text-muted-foreground">
                Per variant
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(((stats.totalVariants - stats.outOfStockCount - stats.lowStockCount) / stats.totalVariants) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Healthy stock
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Overview</CardTitle>
              <CardDescription>
                Manage stock levels for {productName}
              </CardDescription>
            </div>
            <Dialog open={bulkAdjustmentOpen} onOpenChange={setBulkAdjustmentOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={variants.length === 0}>
                  Bulk Adjustment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Stock Adjustment</DialogTitle>
                  <DialogDescription>
                    Apply the same stock adjustment to all variants
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adjustment">Adjustment Amount</Label>
                    <Input
                      id="adjustment"
                      type="number"
                      placeholder="e.g., +10 or -5"
                      value={bulkAdjustment}
                      onChange={(e) => setBulkAdjustment(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use positive numbers to add stock, negative to reduce
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="reason">Reason</Label>
                    <Input
                      id="reason"
                      placeholder="e.g., New shipment, Damaged goods, etc."
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setBulkAdjustmentOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkAdjustment} disabled={loading}>
                    {loading ? 'Applying...' : 'Apply Adjustment'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {variants.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Variants Found</h3>
              <p className="text-muted-foreground mb-4">
                Create product variants first to manage inventory
              </p>
              <Button variant="outline" onClick={() => window.location.hash = '#variants'}>
                Go to Variants Tab
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Low Stock Alert</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{variant.size}</Badge>
                        <Badge variant="outline">{variant.color}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                    <TableCell>{formatCurrency(Number(variant.price))}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => {
                          const newStock = parseInt(e.target.value) || 0;
                          updateVariantStock(variant.id!, newStock);
                        }}
                        className="w-20"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>{variant.lowStockThreshold}</TableCell>
                    <TableCell>{getStockBadge(variant)}</TableCell>
                    <TableCell>
                      {formatCurrency(variant.stock * Number(variant.price))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
