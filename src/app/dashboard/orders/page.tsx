import PageContainer from '@/components/layout/page-container'
import { buttonVariants } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton'
import { OrderListingPage } from '@/features/orders/components/order-listing'
import { searchParamsCache, serialize } from '@/lib/searchparams'
import { cn } from '@/lib/utils'
import { IconPlus } from '@tabler/icons-react'
import Link from 'next/link'
import { SearchParams } from 'nuqs/server'
import { Suspense } from 'react'

export const metadata = {
  title: 'Dashboard: Orders'
}

type pageProps = {
  searchParams: Promise<SearchParams>
}

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams)

  const key = serialize({ ...searchParams })

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Orders'
            description='Manage customer orders and track fulfillment status.'
          />
          <Link
            href='/dashboard/orders/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> Create Order
          </Link>
        </div>
        <Separator />
        <Suspense
          key={key}
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={10} filterCount={3} />
          }
        >
          <OrderListingPage />
        </Suspense>
      </div>
    </PageContainer>
  )
}
