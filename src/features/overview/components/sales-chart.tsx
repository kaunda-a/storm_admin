import { AnalyticsService } from '@/lib/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export async function SalesChart() {
  try {
    const salesData = await AnalyticsService.getSalesData(30) // Last 30 days

    // Group data by date and aggregate
    const chartData = salesData.reduce((acc, item) => {
    const existingDate = acc.find(d => d.date === item.date)
    if (existingDate) {
      existingDate.revenue += item.revenue
      existingDate.orders += item.orders
    } else {
      acc.push({
        date: item.date,
        revenue: item.revenue,
        orders: item.orders
      })
    }
    return acc
  }, [] as Array<{ date: string; revenue: number; orders: number }>)

  // Sort by date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  return (
    <Card className='col-span-4'>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>
          Revenue and order trends for the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Summary Stats */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center p-4 bg-muted/50 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                {formatCurrency(totalRevenue)}
              </div>
              <div className='text-sm text-muted-foreground'>Total Revenue</div>
            </div>
            <div className='text-center p-4 bg-muted/50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {totalOrders}
              </div>
              <div className='text-sm text-muted-foreground'>Total Orders</div>
            </div>
          </div>

          {/* Simple Data Table */}
          <div className='space-y-2'>
            <h4 className='font-semibold text-sm'>Recent Sales Activity</h4>
            <div className='max-h-64 overflow-y-auto'>
              {chartData.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  No sales data available for the selected period
                </div>
              ) : (
                <div className='space-y-2'>
                  {chartData.slice(-10).reverse().map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 bg-muted/30 rounded-md'
                    >
                      <div>
                        <div className='font-medium'>
                          {new Date(item.date).toLocaleDateString('en-ZA', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {item.orders} order{item.orders !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='font-semibold'>
                          {formatCurrency(item.revenue)}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {item.orders > 0 ? formatCurrency(item.revenue / item.orders) : 'R0.00'} avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
  } catch (error) {
    console.error('Error loading sales chart:', error)
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Unable to load sales data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>Error loading sales data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    )
  }
}
