'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import Image from 'next/image';
import { CustomerWithOrders } from '@/lib/services';

export const columns: ColumnDef<CustomerWithOrders>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'imageUrl',
    header: 'Image',
    cell: ({ row }) => {
      const imageUrl = row.getValue('imageUrl') as string;
      return imageUrl ? (
        <div className='relative w-12 h-8 rounded overflow-hidden'>
          <Image
            src={imageUrl}
            alt='Customer'
            fill
            className='object-cover'
          />
        </div>
      ) : (
        <div className='w-12 h-8 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground'>
          No Image
        </div>
      );
    },
    enableSorting: false
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      const email = row.original.email;
      return (
        <div className='max-w-[150px] sm:max-w-[200px]'>
          <div className='font-medium truncate text-sm sm:text-base'>{name}</div>
          {email && (
            <div className='text-xs sm:text-sm text-muted-foreground truncate'>
              {email}
            </div>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string;
      return (
        <div className='text-xs sm:text-sm text-muted-foreground'>
          {phone || '—'}
        </div>
      );
    }
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'} className='text-xs sm:text-sm'>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return (
        <div className='text-xs sm:text-sm text-muted-foreground'>
          {new Date(date).toLocaleDateString()}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

