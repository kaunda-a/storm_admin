'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ProductWithDetails } from '@/lib/services'
import { ProductVariant } from '@prisma/client'

// Type for product images
type ProductImage = ProductWithDetails['images'][0];
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle, Package } from 'lucide-react';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';

export const columns: ColumnDef<ProductWithDetails>[] = [
  {
    id: 'image',
    header: 'IMAGE',
    cell: ({ row }) => {
      const product = row.original;
      const primaryImage = product.images.find((img: ProductImage) => img.isPrimary) || product.images[0];

      return (
        <div className='relative aspect-square w-16 h-16'>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              className='rounded-lg object-cover'
            />
          ) : (
            <div className='w-full h-full bg-gray-200 rounded-lg flex items-center justify-center'>
              <Package className='w-6 h-6 text-gray-400' />
            </div>
          )}
        </div>
      );
    }
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<ProductWithDetails, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className='space-y-1'>
          <div className='font-medium'>{product.name}</div>
          <div className='text-sm text-muted-foreground'>{product.sku}</div>
        </div>
      );
    },
    meta: {
      label: 'Name',
      placeholder: 'Search products...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'category',
    header: ({ column }: { column: Column<ProductWithDetails, unknown> }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Badge variant='outline' className='capitalize'>
          {product.category.name}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'categories',
      variant: 'multiSelect',
      options: CATEGORY_OPTIONS
    }
  },
  {
    id: 'brand',
    header: 'BRAND',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className='font-medium'>{product.brand.name}</div>
      );
    }
  },
  {
    id: 'price',
    header: 'PRICE',
    cell: ({ row }) => {
      const product = row.original;
      const minPrice = Math.min(...product.variants.map((v: ProductVariant) => v.price.toNumber()));
      const maxPrice = Math.max(...product.variants.map((v: ProductVariant) => v.price.toNumber()));

      return (
        <div className='font-medium'>
          {minPrice === maxPrice
            ? `R${minPrice.toFixed(2)}`
            : `R${minPrice.toFixed(2)} - R${maxPrice.toFixed(2)}`
          }
        </div>
      );
    }
  },
  {
    id: 'stock',
    header: 'STOCK',
    cell: ({ row }) => {
      const product = row.original;
      const totalStock = product.variants.reduce((sum, variant: ProductVariant) => sum + variant.stock, 0);
      const isLowStock = product.variants.some((variant: ProductVariant) => variant.stock <= variant.lowStockThreshold);

      return (
        <Badge variant={isLowStock ? 'destructive' : totalStock > 0 ? 'default' : 'secondary'}>
          {totalStock} units
        </Badge>
      );
    }
  },
  {
    id: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      const product = row.original;
      const isActive = product.isActive && product.status === 'ACTIVE';
      const Icon = isActive ? CheckCircle2 : XCircle;

      return (
        <Badge variant={isActive ? 'default' : 'secondary'} className='capitalize'>
          <Icon className='w-3 h-3 mr-1' />
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
