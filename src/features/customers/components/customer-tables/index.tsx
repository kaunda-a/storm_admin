'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useQueryState, parseAsInteger } from 'nuqs';
import { CustomerEmptyState } from './customer-empty-state';

interface CustomerTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
}

export function CustomerTable<TData, TValue>({
  data,
  totalItems,
  columns
}: CustomerTableParams<TData, TValue>) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));

  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data, // customer data
    columns, // customer columns
    pageCount: pageCount,
    shallow: false, // Setting to false triggers a network request with the updated querystring.
    debounceMs: 500
  });

  // Show empty state if no data
  if (data.length === 0 && totalItems === 0) {
    return <CustomerEmptyState />;
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

