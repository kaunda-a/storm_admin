'use client';

import * as React from 'react';
import { ProductVariant } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Edit, Trash2, Copy, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useDataTable } from '@/hooks/use-data-table';
import { cn } from '@/lib/utils';

interface VariantTableProps {
  variants: ProductVariant[];
  onEdit: (variant: ProductVariant) => void;
  onDelete: (variant: ProductVariant) => void;
  onDuplicate: (variant: ProductVariant) => void;
  onStockUpdate: (variantId: string, newStock: number) => void;
  loading?: boolean;
}

export function VariantTable({
  variants,
  onEdit,
  onDelete,
  onDuplicate,
  onStockUpdate,
  loading = false
}: VariantTableProps) {
  const [editingStock, setEditingStock] = React.useState<string | null>(null);
  const [stockValue, setStockValue] = React.useState<string>('');

  const handleStockEdit = (variant: ProductVariant) => {
    setEditingStock(variant.id!);
    setStockValue(variant.stock.toString());
  };

  const handleStockSave = (variantId: string) => {
    const newStock = parseInt(stockValue);
    if (!isNaN(newStock) && newStock >= 0) {
      onStockUpdate(variantId, newStock);
    }
    setEditingStock(null);
    setStockValue('');
  };

  const handleStockCancel = () => {
    setEditingStock(null);
    setStockValue('');
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

  const columns: ColumnDef<ProductVariant>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <div className="font-mono text-xs break-all max-w-[80px] sm:max-w-none">{row.getValue('sku')}</div>
      ),
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">{row.getValue('size')}</Badge>
      ),
    },
    {
      accessorKey: 'color',
      header: 'Color',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">{row.getValue('color')}</Badge>
      ),
    },
    {
      accessorKey: 'material',
      header: 'Material',
      cell: ({ row }) => {
        const material = row.getValue('material') as string;
        return material ? <span className="text-xs sm:text-sm">{material}</span> : <span className="text-muted-foreground text-xs sm:text-sm">-</span>;
      },

    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('price'));
        return <div className="font-medium">${price.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        const variant = row.original;
        const isEditing = editingStock === variant.id;

        if (isEditing) {
          return (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
                className="w-16 sm:w-20 h-8 text-xs sm:text-sm"
                min="0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleStockSave(variant.id!);
                  } else if (e.key === 'Escape') {
                    handleStockCancel();
                  }
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleStockSave(variant.id!)}
                className="h-8 w-8 p-0"
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleStockCancel}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStockEdit(variant)}
              className="flex items-center gap-2 hover:bg-muted p-1 rounded"
            >
              <span className={cn(
                "font-medium",
                variant.stock === 0 && "text-red-600",
                variant.stock <= variant.lowStockThreshold && variant.stock > 0 && "text-yellow-600"
              )}>
                {variant.stock}
              </span>
              {variant.stock <= variant.lowStockThreshold && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const variant = row.original;
        return (
          <div className="flex items-center gap-2">
            {getStockBadge(variant)}
            {!variant.isActive && <Badge variant="secondary">Inactive</Badge>}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const variant = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(variant.sku)}>
                Copy SKU
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(variant)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Variant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(variant)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(variant)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const { table } = useDataTable({
    data: variants,
    columns,
    pageCount: Math.ceil(variants.length / 10), // Simple pagination
    shallow: false,
    debounceMs: 500
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[700px] px-4 sm:px-0">
          <DataTable table={table}>
            <DataTableToolbar table={table} />
          </DataTable>
        </div>
      </div>
    </div>
  );
}
