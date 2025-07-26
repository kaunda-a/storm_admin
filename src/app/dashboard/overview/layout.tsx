import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import React from 'react';
import { DashboardStats } from '@/features/overview/components/dashboard-stats';
import { BillboardContainer } from '@/components/layout/billboard-container';
import { SalesChart } from '@/features/overview/components/sales-chart';
import { TopProducts } from '@/features/overview/components/top-products';
import { RecentSales } from '@/features/overview/components/recent-sales';

export default function OverViewLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Welcome to Mzansi Footwear Admin 👟
          </h2>
        </div>

        <DashboardStats />

        <BillboardContainer
          position="DASHBOARD_TOP"
          className="mb-6"
        />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <SalesChart />
          <TopProducts />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>
            <RecentSales />
          </div>
          <div className='col-span-4 md:col-span-3'>
            {/* Additional analytics can go here */}
            {children}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
