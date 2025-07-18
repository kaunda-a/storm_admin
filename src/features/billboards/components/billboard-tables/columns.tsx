'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import Image from 'next/image';

export type BillboardData = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type: string;
  position: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<BillboardData>[] = [
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
            alt='Billboard'
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
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => {
      const title = row.getValue('title') as string;
      const description = row.original.description;
      return (
        <div className='max-w-[150px] sm:max-w-[200px]'>
          <div className='font-medium truncate text-sm sm:text-base'>{title}</div>
          {description && (
            <div className='text-xs sm:text-sm text-muted-foreground truncate'>
              {description}
            </div>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      return (
        <Badge variant='outline' className='capitalize text-xs sm:text-sm'>
          {type.replace('_', ' ').toLowerCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'position',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Position' />
    ),
    cell: ({ row }) => {
      const position = row.getValue('position') as string;
      return (
        <Badge variant='secondary' className='capitalize text-xs sm:text-sm'>
          {position.replace('_', ' ').toLowerCase()}
        </Badge>
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
    accessorKey: 'sortOrder',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Order' />
    ),
    cell: ({ row }) => {
      const sortOrder = row.getValue('sortOrder') as number;
      return <div className='text-center'>{sortOrder}</div>;
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
