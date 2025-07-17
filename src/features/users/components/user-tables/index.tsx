'use client'

import { DataTable } from '@/components/ui/table/data-table'
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar'
import { UsersEmptyState } from '@/components/ui/empty-state'
import { UserWithDetails } from '@/lib/services'
import { useDataTable } from '@/hooks/use-data-table'
import { ColumnDef } from '@tanstack/react-table'
import { parseAsInteger, useQueryState } from 'nuqs'

interface UserTableProps {
  data: UserWithDetails[]
  totalItems: number
  columns: ColumnDef<UserWithDetails>[]
}

export function UserTable({ data, totalItems, columns }: UserTableProps) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10))
  const pageCount = Math.ceil(totalItems / pageSize)

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: false,
    debounceMs: 500
  })

  // Show empty state if no data
  if (data.length === 0 && totalItems === 0) {
    return <UsersEmptyState />;
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  )
}
