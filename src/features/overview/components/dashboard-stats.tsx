import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsService } from '@/lib/services'
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'

export async function DashboardStats() {
  const stats = await AnalyticsService.getDashboardStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-ZA').format(num)
  }

  const formatGrowth = (growth: number) => {
    // Handle NaN or infinite values
    if (!isFinite(growth)) {
      return (
        <Badge variant='secondary'>
          <IconTrendingUp className='w-3 h-3 mr-1' />
          New
        </Badge>
      )
    }

    const isPositive = growth >= 0
    const Icon = isPositive ? IconTrendingUp : IconTrendingDown
    const variant = isPositive ? 'default' : 'destructive'

    return (
      <Badge variant={variant}>
        <Icon className='w-3 h-3 mr-1' />
        {isPositive ? '+' : ''}{growth.toFixed(1)}%
      </Badge>
    )
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {/* Total Revenue */}
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatCurrency(stats.totalRevenue)}
          </CardTitle>
          <CardAction>
            {formatGrowth(stats.revenueGrowth)}
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {stats.revenueGrowth >= 0 ? 'Trending up' : 'Trending down'} this month
            {stats.revenueGrowth >= 0 ? 
              <IconTrendingUp className='size-4' /> : 
              <IconTrendingDown className='size-4' />
            }
          </div>
          <div className='text-muted-foreground'>
            Revenue for the last month
          </div>
        </CardFooter>
      </Card>

      {/* Total Orders */}
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatNumber(stats.totalOrders)}
          </CardTitle>
          <CardAction>
            {formatGrowth(stats.ordersGrowth)}
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {stats.ordersGrowth >= 0 ? 'Growing' : 'Declining'} order volume
            {stats.ordersGrowth >= 0 ? 
              <IconTrendingUp className='size-4' /> : 
              <IconTrendingDown className='size-4' />
            }
          </div>
          <div className='text-muted-foreground'>
            Orders placed this month
          </div>
        </CardFooter>
      </Card>

      {/* Total Customers */}
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Active Customers</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatNumber(stats.totalCustomers)}
          </CardTitle>
          <CardAction>
            {formatGrowth(stats.customersGrowth)}
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Customer base {stats.customersGrowth >= 0 ? 'expanding' : 'shrinking'}
            {stats.customersGrowth >= 0 ? 
              <IconTrendingUp className='size-4' /> : 
              <IconTrendingDown className='size-4' />
            }
          </div>
          <div className='text-muted-foreground'>
            New customers this month
          </div>
        </CardFooter>
      </Card>

      {/* Total Products */}
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Products</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            {formatNumber(stats.totalProducts)}
          </CardTitle>
          <CardAction>
            {formatGrowth(stats.productsGrowth)}
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Catalog {stats.productsGrowth >= 0 ? 'expanding' : 'shrinking'}
            {stats.productsGrowth >= 0 ? 
              <IconTrendingUp className='size-4' /> : 
              <IconTrendingDown className='size-4' />
            }
          </div>
          <div className='text-muted-foreground'>
            Active products in catalog
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
