import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import CustomerListingPage from '@/features/customers/components/customer-listing';
import { searchParamsCache, serialize } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Customers'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  // Allow nested RSCs to access the search params (in a type-safe way)
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0'>
          <Heading
            title='Customers'
            description='Manage customers (Server side table functionalities.)'
          />
          <Link
            href='/dashboard/customers/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm w-fit')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> 
          </Link>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          <CustomerListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}

